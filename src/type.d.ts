import { Request } from 'express'
import { User } from './models/schemas/Users.schema'
import Post from './models/schemas/Posts.schema'

declare module 'express' {
  interface Request {
    user?: User
    post?: Post
    email_verify_token?
    decoded_authorization?
    decoded_refresh_authorization?
    user_forgot_password?
  }
}
