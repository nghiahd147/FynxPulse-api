import { JwtPayload } from "jsonwebtoken"

export interface RegisterRequest {
  email: string
  first_name: string
  last_name: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface UpdateMeRequest {
  first_name?: string
  last_name?: string
  date_of_birth?: Date
  bio?: string
  location?: string
  website?: string
  avatar?: string
  profile_picture_url?: string
}

export interface QueryParamsFollow {
  lastname: string
}

export interface JsonPayload extends JwtPayload {
  user_id: string,
  verify_token: string,
  exp: number,
  iat: number
}
