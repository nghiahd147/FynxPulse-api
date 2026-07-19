export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum Role {
  admin,
  user
}

export enum TypeToken {
  AcessToken,
  RefreshToken,
  EmailVerifyToken,
  PasswordForgotToken,
  ForgotPasswordToken
}

export enum TypePost {
  Post,
  Repost,
  Comment,
  QuotePost
}

export enum TypeMedia {
  Image,
  Video,
  HLS
}

export enum PostAudience {
  Everyone,
  FynxCircle
}

export enum EmotionTypes {
  Like,
  Heart,
  Haha,
  Sad,
  Wow
}

export enum EncodeVideoStatus {
  Pending,
  Processing,
  Success,
  Failed
}
