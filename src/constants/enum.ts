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
  url,
  type
}

export enum PostAudience {
  everyone,
  fynx_circle
}
