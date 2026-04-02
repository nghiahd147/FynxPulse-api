import { Filter, ObjectId } from 'mongodb'
import { TypeToken, UserVerifyStatus } from '~/constants/enum'
import { USER_MESSAGES } from '~/constants/messages'
import { RegisterRequest } from '~/models/requests/users.requests'
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

  async signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.AcessToken
      },
      private_key: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '30m'
      }
    })
  }

  async signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.RefreshToken
      },
      private_key: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '100d'
      }
    })
  }

  async verifyEmailToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.EmailVerifyToken
      },
      private_key: process.env.JWT_SECRET_VERIFY_EMAIL as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signAccessAndRefreshToken(id: string) {
    return Promise.all([this.signAccessToken(id), this.signRefreshToken(id)])
  }

  async register(payload: RegisterRequest) {
    const user_id = new ObjectId()
    const email_verify_token = await this.verifyEmailToken(user_id.toString())

    await databaseServices.users().insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token: email_verify_token as string
      })
    )

    const [acessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id.toString())
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken as string }))

    console.log('email_verify_token', email_verify_token)

    return {
      acessToken,
      refreshToken
    }
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users().findOne({ email })
    return Boolean(result)
  }

  async login(user_id: string) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id)
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken as string }))
    return {
      accessToken,
      refreshToken
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
          update_at: new Date()
        }
      }
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    return {
      access_token,
      refresh_token
    }
  }
}

const userServices = new UserServices()
export default userServices
