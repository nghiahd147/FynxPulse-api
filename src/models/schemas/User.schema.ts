import { ObjectId } from 'mongodb'

enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

enum Role {
  admin,
  user
}

interface UserType {
  _id?: ObjectId
  email: string
  password: string
  name?: string
  first_name?: string
  last_name?: string
  email_verify_token?: string
  forgot_password_token?: string
  role?: Role
  is_active?: boolean
  created_at?: Date
  update_at?: Date
  verify?: UserVerifyStatus

  bio?: string
  location?: string
  website?: string
  avatar?: string
  profile_picture_url?: string
}

export default class User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  first_name: string
  last_name: string
  email_verify_token: string
  forgot_password_token: string
  role: Role
  is_active: boolean
  created_at: Date
  update_at: Date
  verify: UserVerifyStatus

  bio: string
  location: string
  website: string
  avatar: string
  profile_picture_url: string

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.email = user.email
    this.password = user.password
    this.name = user.name || ''
    this.first_name = user.first_name || ''
    this.last_name = user.last_name || ''
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.role = user.role || Role.user
    this.is_active = user.is_active || false
    this.created_at = user.created_at || date
    this.update_at = user.update_at || date
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.avatar = user.avatar || ''
    this.profile_picture_url = user.profile_picture_url || ''
  }
}
