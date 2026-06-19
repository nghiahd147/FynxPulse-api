import { Request } from 'express'
import { User } from './models/schemas/Users.schema'

declare module 'express' {
  interface Request {
    user?: User
    email_verify_token?
    decoded_authorization?
    decoded_refresh_authorization?
    user_forgot_password?
  }
}
