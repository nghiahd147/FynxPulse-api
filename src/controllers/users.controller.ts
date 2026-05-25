import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '../constants/enum'
import { RegisterRequest } from '~/models/requests/users.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import databaseServices from '~/services/database.services'
import userServices from '~/services/users.services'
import { USER_MESSAGES } from '~/constants/messages'
import { parseBoolean } from '~/utils/convert'
import { ErrorWithHandler } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { pick } from 'lodash'

export const getUsersController = async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10)
  const page_size = parseInt((req.query.page_size as string) || '10', 10)
  const currentPage = (page - 1) * page_size

  const filters = {}
  const searchParams = req.query.search || ''
  const verifyStatus = req.query.verify || ''
  const isActive = req.query.is_active || ''
  const role = req.query.role || ''

  if (role) {
    Object.assign(filters, { role: Number(role) })
  }

  if (isActive) {
    Object.assign(filters, { is_active: parseBoolean(isActive) })
  }

  if (verifyStatus) {
    Object.assign(filters, { verify: Number(verifyStatus) })
  }

  if (searchParams) {
    Object.assign(filters, {
      email: { $regex: searchParams, $options: 'i' }
    })
  }

  const totalUsers = await databaseServices.users().countDocuments(filters)

  if (page == -1 && page_size == -1) {
    const allUsers = await userServices.getAllUsers()
    return res.status(200).json({
      data: allUsers,
      pagination: {
        total: totalUsers,
        page,
        page_size
      }
    })
  }

  const users = await userServices.getList({ page_size, currentPage, filters })

  return res.status(200).json({
    data: users,
    pagination: {
      total: totalUsers,
      page,
      page_size
    }
  })
}

export const getDetailUserController = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(404).json({ message: 'User is not found!' })
  }

  res.status(200).json({
    data: user
  })
}

export const bandUserController = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(404).json({ message: 'User is not found!' })
  }

  const userBand = await databaseServices
    .users()
    .updateOne({ _id: new ObjectId(userId) }, { $set: { is_active: false } })

  res.status(200).json({
    data: userBand,
    message: 'Band user successfully'
  })
}

export const unBandUserController = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(404).json({ message: 'User is not found!' })
  }

  const userBand = await databaseServices
    .users()
    .updateOne({ _id: new ObjectId(userId) }, { $set: { is_active: true } })

  res.status(200).json({
    data: userBand,
    message: 'Band user successfully'
  })
}

export const switchRoleUserController = async (req: Request, res: Response) => {
  const { userId } = req.params
  const { role } = req.body

  const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(404).json({ message: 'User is not defied' })
  }

  const userSwitch = await databaseServices.users().updateOne({ _id: new ObjectId(userId) }, { $set: { role: role } })

  res.status(200).json({
    data: userSwitch,
    message: 'Switch user successfully'
  })
}

export const deleteUserController = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(404).json({ message: 'User is not defied' })
  }

  await databaseServices.users().deleteOne({ _id: new ObjectId(userId) })

  res.status(200).json({
    message: 'Deleted user successfully'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequest>, res: Response) => {
  const result = await userServices.register(req.body)
  res.status(201).json({
    result,
    message: USER_MESSAGES.REGISTER_SUCCESS
  })
}

export const loginController = async (req: Request, res: Response) => {
  const { _id, verify, email, first_name, last_name, user_name } = req.user
  const result = await userServices.login({ user_id: _id.toString(), verify })
  return res.status(200).json({
    result,
    user: {
      email,
      name: first_name + ' ' + last_name,
      user_name
    },
    message: USER_MESSAGES.LOGIN_SUCCESS
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await userServices.logout(refresh_token)
  return res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.email_verify_token

  const user = await databaseServices.users().findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithHandler({
      message: USER_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  if (user.email_verify_token == '') {
    return res.status(200).json({
      message: USER_MESSAGES.EMAIL_ALREADY
    })
  }

  const result = await userServices.verifyEmail(user_id)

  return res.status(200).json({
    result,
    message: USER_MESSAGES.VERIFY_EMAIL_SUCCESS
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id, verify } = req.user
  const result = await userServices.forgotPassword({ user_id: _id.toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  return res.json({
    message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { _id } = req.user_forgot_password
  const { password } = req.body
  const result = await userServices.resetPassword(_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const result = await userServices.getMe(user_id)
  return res.status(200).json({
    message: USER_MESSAGES.GET_ME_SUCCESSFULLY,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id, verify } = req.decoded_authorization
  const user = await databaseServices.users().findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(404).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(400).json({
      message: USER_MESSAGES.EMAIL_ALREADY
    })
  }
  const result = await userServices.resendEmailVerify({ user_id, verify })
  return res.status(200).json({ result })
}

export const updateMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const body = pick(req.body, [
    'first_name',
    'last_name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'profile_picture_url'
  ])
  const result = await userServices.updateMe(user_id, body)
  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileUser = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await userServices.getProfileUser(username)
  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.GET_PROFILE_USER_SUCCESS,
    result
  })
}

export const followController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { follower_user_id } = req.body
  const result = await userServices.follow(user_id, follower_user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.FOLLOW_USER_SUCCESS,
    result
  })
}

export const getUserFollow = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { follower_user_id } = req.params
  const result = await userServices.getUserFollow(user_id, follower_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { follower_user_id } = req.params
  const result = await userServices.unfollow(user_id, follower_user_id)
  return res.json(result)
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { password } = req.body
  const result = await userServices.changePassword(user_id, password)
  return res.json(result)
}
