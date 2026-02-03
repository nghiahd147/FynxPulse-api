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
  PasswordForgotToken
}
