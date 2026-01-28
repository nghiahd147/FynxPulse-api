import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userServices from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const { email, pass } = req.body
  if (!email || !pass) {
    return res.status(400).json({ message: 'Email or Pass is not defied' })
  }
  next()
}

export const registerValidation = validate(
  checkSchema({
    email: {
      isEmail: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: async (value) => {
          const result = await userServices.checkEmailExist(value)
          if (result) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    first_name: {
      isString: true,
      notEmpty: true,
      trim: true
    },
    last_name: {
      isString: true,
      notEmpty: true,
      trim: true
    },
    password: {
      isString: true,
      notEmpty: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
      },
      trim: true
    },
    confirm_password: {
      isString: true,
      notEmpty: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
      },
      trim: true,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('The passwords are different')
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
        }
      }
    }
  })
)
