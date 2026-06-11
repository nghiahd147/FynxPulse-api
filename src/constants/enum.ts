export enum UserVerifyStatus {
  Unverified,
  Verified
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
  Video
}

export enum PostAudience {
  Everyone,
  FynxCircle
}
