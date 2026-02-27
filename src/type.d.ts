import { Request } from 'express'
import { User } from './models/schemas/Users.schema'

declare module 'express' {
  interface Request {
    user?: User
  }
}
