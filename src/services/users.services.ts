import axios from 'axios'
import { Filter, ObjectId } from 'mongodb'
import { TypeToken, UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import { RegisterRequest, UpdateMeRequest } from '~/models/requests/users.requests'
import Followers from '~/models/schemas/Followers.chema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/Users.schema'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'

type FiltesUser = Filter<User>

class UserServices {
  async getList(payload: { page_size: number; currentPage: number; filters: FiltesUser }) {
    const { page_size, currentPage, filters } = payload
    const result = await databaseServices.users().find(filters).skip(currentPage).limit(page_size).toArray()
    return result
  }

  async getAllUsers() {
    const result = await databaseServices.users().find({}).toArray()
    return result
  }

  async signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.AcessToken,
        verify
      },
      private_key: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '30m'
      }
    })
  }

  async signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.RefreshToken,
        verify
      },
      private_key: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '100d'
      }
    })
  }

  async signEmailToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.EmailVerifyToken,
        verify
      },
      private_key: process.env.JWT_SECRET_VERIFY_EMAIL as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  async forgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.ForgotPasswordToken,
        verify
      },
      private_key: process.env.JWT_SECRET_FORGOT_PASSWORD as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async register(payload: RegisterRequest) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseServices.users().insertOne(
      new User({
        ...payload,
        _id: user_id,
        user_name: `user${user_id}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token: email_verify_token as string
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token as string }))

    console.log('email_verify_token', email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users().findOne({ email })
    return Boolean(result)
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token as string }))
    return {
      access_token,
      refresh_token
    }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data
  }

  async oauthGoogle(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const data = await this.getGoogleUserInfo(access_token, id_token)
    if (!data.verified_email) {
      throw new ErrorWithHandler({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseServices.users().findOne({ email: data.email })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      databaseServices
        .refreshToken()
        .insertOne(new RefreshToken({ user_id: new ObjectId(user._id), token: refresh_token as string }))
      return {
        access_token,
        refresh_token,
        newUser: false
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const result = await this.register({
        email: data.email,
        first_name: data.given_name,
        last_name: data.family_name,
        password,
        confirm_password: password,
        date_of_birth: new Date().toISOString()
      })
      return { ...result, newUser: true }
    }
  }

  async logout(refresh_token: string) {
    await databaseServices.refreshToken().deleteOne({ token: refresh_token })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    await databaseServices.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: new Date()
        }
      }
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })

    return {
      access_token,
      refresh_token
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.forgotPasswordToken({ user_id, verify })
    await databaseServices.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: (forgot_password_token as string) || '',
          updated_at: new Date()
        }
      }
    )
    return {
      message: USER_MESSAGES.CHECK_EMAIL_FORGOT_PASSWORD_SUCCESS
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseServices.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password),
          updated_at: new Date()
        }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseServices.users().findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          role: 0,
          is_active: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    return user
  }

  async resendEmailVerify({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const email_verify_token = await this.signEmailToken({ user_id, verify })
    await databaseServices.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: email_verify_token as string,
          updated_at: new Date()
        }
      }
    )
    return {
      message: USER_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }

  async updateMe(user_id: string, body: UpdateMeRequest) {
    const updateUser = await databaseServices.users().findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...body
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          verify: 0
        }
      }
    )
    return updateUser
  }

  async getProfileUser(user_name: string) {
    const user = await databaseServices.users().findOne(
      { user_name },
      {
        projection: {
          role: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          verify: 0
        }
      }
    )
    return user
  }

  async follow(user_id: string, follower_user_id: string) {
    const follow = await databaseServices.followers().findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (!follow) {
      await databaseServices.followers().insertOne(
        new Followers({
          user_id: new ObjectId(user_id),
          follower_user_id: new ObjectId(follower_user_id)
        })
      )
      return {
        message: USER_MESSAGES.FOLLOW_USER_SUCCESS
      }
    }
    return {
      message: USER_MESSAGES.FOLLOWED
    }
  }

  async unfollow(user_id: string, follower_user_id: string) {
    const followers = await databaseServices.followers().findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (followers == null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await databaseServices.followers().deleteOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(follower_user_id)
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async getUserFollow(user_id: string, follower_user_id: string) {
    const user = await databaseServices.followers().findOne({
      user_id: new ObjectId(user_id),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (!user) {
      return {
        followed: false,
        message: USER_MESSAGES.NOT_FOLLOWING_THIS_USER
      }
    }
    return {
      followed: true,
      message: USER_MESSAGES.ALREADY_FOLLOWING_THIS_USER
    }
  }

  async changePassword(user_id: string, new_password: string) {
    await databaseServices.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async getListFriends(user_id: string) {
    const listFriends = await databaseServices.users().find({}).toArray()
    const followed = await databaseServices
      .followers()
      .find({ user_id: new ObjectId(user_id) })
      .toArray()
    const result = listFriends.filter((item) => {
      return followed.every((follow) => {
        return item._id?.toString() !== user_id && item._id.toString() !== follow.follower_user_id.toString()
      })
    })
    return {
      friends: result,
      message: USER_MESSAGES.GET_LIST_FRIENDS_SUCCESS
    }
  }

  async getListMyFriends(user_id: string) {
    const followed = await databaseServices
      .followers()
      .find({ user_id: new ObjectId(user_id) })
      .toArray()

    const followerIds = followed.map((item) => new ObjectId(item.follower_user_id))
    const friends = followerIds.length
      ? await databaseServices
          .users()
          .find(
            { _id: { $in: followerIds } },
            {
              projection: {
                is_active: 0,
                role: 0,
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                created_at: 0,
                updated_at: 0,
                verify: 0
              }
            }
          )
          .toArray()
      : []

    return {
      friends,
      message: USER_MESSAGES.GET_LIST_MY_FRIENDS_SUCCESS
    }
  }
}

const userServices = new UserServices()
export default userServices
