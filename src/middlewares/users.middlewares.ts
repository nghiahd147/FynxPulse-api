import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
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
      isEmpty: true,
      trim: true
    },
    first_name: {
      isEmail: true,
      isEmpty: true,
      trim: true
    },
    last_name: {
      isEmail: true,
      isEmpty: true,
      trim: true
    },
    password: {
      isString: true,
      isEmpty: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      trim: true
    },
    confirm_password: {
      isString: true,
      isEmpty: true,
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      trim: true
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
