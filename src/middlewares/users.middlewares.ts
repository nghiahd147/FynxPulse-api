import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidation = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_MUST_BE_NOT_EMPTY
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseServices
              .users()
              .findOne({ email: value, password: hashPassword(req.body.password) })
            if (!user) {
              throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_NOT_EMPTY
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_STRONG
        },
        trim: true
      }
    },
    ['body']
  )
)

export const registerValidation = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_MUST_BE_NOT_EMPTY
        },
        trim: true,
        custom: {
          options: async (value) => {
            const result = await userServices.checkEmailExist(value)
            if (result) {
              throw new Error(USER_MESSAGES.EMAIL_IS_EXIST)
            }
            return true
          }
        }
      },
      first_name: {
        isString: {
          errorMessage: USER_MESSAGES.FIRST_NAME_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.FIRST_NAME_MUST_BE_NOT_EMPTY
        },
        trim: true
      },
      last_name: {
        isString: {
          errorMessage: USER_MESSAGES.LAST_NAME_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.LAST_NAME_MUST_BE_NOT_EMPTY
        },
        trim: true
      },
      password: {
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_NOT_EMPTY
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_STRONG
        },
        trim: true
      },
      confirm_password: {
        isString: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_NOT_EMPTY
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_STRONG
        },
        trim: true,
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MATCH)
            }
            return true
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_NOT_EMPTY
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidation = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_NOT_VALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const decoded_authorization = await verifyToken({ token: access_token })
            req.decoded_authorization = decoded_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidation = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const refresh_token = await databaseServices.refreshToken().findOne({ token: value })
            if (refresh_token === null) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.REFRESH_TOKEN_DOES_NOT_EXIST,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            try {
              const decoded_refresh_authorization = await verifyToken({ token: value })
              req.decoded_refresh_authorization = decoded_refresh_authorization
            } catch (error) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_VALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
