import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithHandler } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
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

const confirmPasswordSchema: ParamSchema = {
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
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      try {
        if (!value) {
          throw new ErrorWithHandler({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseServices.users().findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          throw new ErrorWithHandler({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithHandler({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.user_forgot_password = user
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithHandler({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const followUserIdSchema: ParamSchema = {
  custom: {
    options: async (value) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithHandler({
          message: USER_MESSAGES.FOLLOW_USER_ID_IS_NOT_VALID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const user = await databaseServices.users().findOne({ _id: new ObjectId(value) })
      if (!user) {
        throw new ErrorWithHandler({
          message: USER_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

export const loginValidator = validate(
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

export const registerValidator = validate(
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
        }
      },
      last_name: {
        isString: {
          errorMessage: USER_MESSAGES.LAST_NAME_IS_STRING
        },
        notEmpty: {
          errorMessage: USER_MESSAGES.LAST_NAME_MUST_BE_NOT_EMPTY
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
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

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNPROCESSABLE_CONTENT
              })
            }
            const access_token = value.split(' ')[1]
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
            req.decoded_authorization = decoded_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNPROCESSABLE_CONTENT
              })
            }
            try {
              const [refresh_token, decoded_refresh_authorization] = await Promise.all([
                databaseServices.refreshToken().findOne({ token: value }),
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                })
              ])
              if (refresh_token === null) {
                throw new ErrorWithHandler({
                  message: USER_MESSAGES.REFRESH_TOKEN_DOES_NOT_EXIST,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }
              req.decoded_refresh_authorization = decoded_refresh_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithHandler({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithHandler({
                message: USER_MESSAGES.EMAIL_VERIFY_IS_REQUIRED,
                status: HTTP_STATUS.UNPROCESSABLE_CONTENT
              })
            }
            try {
              const email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_VERIFY_EMAIL as string
              })
              req.email_verify_token = email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithHandler({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      trim: true,
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const user = await databaseServices.users().findOne({ email: value })
          if (!user) {
            throw new ErrorWithHandler({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.user = user
          return true
        }
      }
    }
  })
)

export const verifyForgotPasswordValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const verifiedEmailValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithHandler({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.FOBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema({
    first_name: {
      isString: {
        errorMessage: USER_MESSAGES.FIRST_NAME_IS_STRING
      },
      optional: true
    },
    last_name: {
      isString: {
        errorMessage: USER_MESSAGES.LAST_NAME_IS_STRING
      },
      optional: true
    },
    user_name: {
      trim: true,
      custom: {
        options: async (value) => {
          if (!REGEX_USERNAME.test(value)) {
            throw Error(USER_MESSAGES.USER_NAME_INVALID)
          }
          const user = await databaseServices.users().findOne({ user_name: value })
          if (!user) {
            throw Error(USER_MESSAGES.USER_NOT_FOUND)
          }
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
      optional: true
    },
    bio: {
      isString: {
        errorMessage: USER_MESSAGES.BIO_IS_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 500
        },
        errorMessage: USER_MESSAGES.BIO_MUST_BE_BETWEEN_1_AND_500_CHARACTERS
      },
      optional: true
    },
    location: {
      isString: {
        errorMessage: USER_MESSAGES.LOCATION_IS_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USER_MESSAGES.LOCATION_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
      },
      optional: true
    },
    website: {
      isURL: {
        options: {
          require_protocol: true
        },
        errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_A_VALID_URL_WITH_PROTOCOL
      },
      optional: true
    },
    avatar: {
      isURL: {
        options: {
          require_protocol: true
        },
        errorMessage: USER_MESSAGES.AVATAR_MUST_BE_A_VALID_URL_WITH_PROTOCOL
      },
      optional: true
    },
    profile_picture_url: {
      isURL: {
        options: {
          require_protocol: true
        },
        errorMessage: USER_MESSAGES.PROFILE_PICTURE_URL_MUST_BE_A_VALID_URL_WITH_PROTOCOL
      },
      optional: true
    }
  })
)

export const followValidator = validate(
  checkSchema(
    {
      follower_user_id: followUserIdSchema
    },
    ['body']
  )
)

export const unFollowValidator = validate(
  checkSchema({
    follower_user_id: followUserIdSchema
  })
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decoded_authorization
          const user = await databaseServices.users().findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithHandler({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const isMatch = hashPassword(value) === user.password
          if (!isMatch) {
            throw new ErrorWithHandler({
              message: USER_MESSAGES.CURRENT_PASSWORD_IS_INCORRECT,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
