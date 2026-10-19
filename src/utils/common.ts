import { Request } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import { verifyToken } from './jwt'

export const numberEnumToArray = (type: { [key: string]: number | string }) => {
  return Object.values(type).filter((item) => typeof item === 'number') as number[]
}

export const verifyAccessToken = async (token: string, req?: Request) => {
  const access_token = token.split(' ')[1]
  if (!access_token) {
    throw new ErrorWithHandler({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_NOT_VALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  const decoded_authorization = await verifyToken({
    token: access_token,
    secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
  })
  if (req) {
    req.decoded_authorization = decoded_authorization
    return true
  }
  return decoded_authorization
}
