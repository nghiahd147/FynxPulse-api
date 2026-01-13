import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true
    },
    name: {
      type: String,
      require: true
    },
    first_name: {
      type: String,
      require: true
    },
    last_name: {
      type: String,
      require: true
    },
    email_verify_token: {
      type: String,
      require: true
    },
    forgot_password_token: {
      type: String,
      require: true
    },
    role: {
      enum: ['admin', 'client'],
      default: 'client'
    },
    is_active: {
      type: Boolean,
      default: false
    },
    verify: {
      enum: ['unverified', 'verified', 'banned'],
      default: 'unverified'
    },
    bio: {
      type: String
    },
    location: {
      type: String
    },
    website: {
      type: String
    },
    avatar: {
      type: String
    },
    profile_picture_url: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', userSchema)

export default User
