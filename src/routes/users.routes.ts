import express from 'express'
import {
  getUsersController,
  getDetailUserController,
  registerController,
  bandUserController,
  unBandUserController,
  switchRoleUserController,
  deleteUserController,
  loginController,
  logoutController,
  emailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  resendEmailVerifyController,
  updateMeController,
  getProfileUser,
  followController,
  unfollowController,
  checkUserFollowStatus,
  changePasswordController,
  oauthController,
  getFriendSuggestionsController,
  getUserFollowingController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedEmailValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const userRouter = express.Router()

userRouter.get('/', accessTokenValidator, wrapHandlers(getUsersController))
userRouter.get('/me', accessTokenValidator, wrapHandlers(getMeController))
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedEmailValidator,
  updateMeValidator,
  wrapHandlers(updateMeController)
)
userRouter.get('/:user_id/following', accessTokenValidator, wrapHandlers(getUserFollowingController))
userRouter.get('/:user_id/follow-suggestions', accessTokenValidator, wrapHandlers(getFriendSuggestionsController))
userRouter.get('/:username', wrapHandlers(getProfileUser))
userRouter.get('/:userId', accessTokenValidator, wrapHandlers(getDetailUserController))
userRouter.patch('/:userId/ban', accessTokenValidator, wrapHandlers(bandUserController))
userRouter.patch('/:userId/unban', accessTokenValidator, wrapHandlers(unBandUserController))
userRouter.patch('/:userId/role', accessTokenValidator, wrapHandlers(switchRoleUserController))
userRouter.delete('/:userId', accessTokenValidator, wrapHandlers(deleteUserController))
userRouter.post('/register', registerValidator, wrapHandlers(registerController))
userRouter.post('/login', loginValidator, wrapHandlers(loginController))
userRouter.get('/oauth/google', wrapHandlers(oauthController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapHandlers(logoutController))
userRouter.post('/email-verify', emailVerifyValidator, wrapHandlers(emailVerifyController))
userRouter.post('/resend-email-verify', accessTokenValidator, wrapHandlers(resendEmailVerifyController))
userRouter.post('/forgot-password', forgotPasswordValidator, wrapHandlers(forgotPasswordController))
userRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, wrapHandlers(verifyForgotPasswordController))
userRouter.post('/reset-password', resetPasswordValidator, wrapHandlers(resetPasswordController))
userRouter.post(
  '/follow',
  accessTokenValidator,
  // verifiedEmailValidator,
  followValidator,
  wrapHandlers(followController)
)
userRouter.get(
  '/follow-status/:follower_user_id',
  accessTokenValidator,
  // verifiedEmailValidator,
  wrapHandlers(checkUserFollowStatus)
)
userRouter.delete(
  '/unfollow/:follower_user_id',
  accessTokenValidator,
  // verifiedEmailValidator,
  unFollowValidator,
  wrapHandlers(unfollowController)
)
userRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedEmailValidator,
  changePasswordValidator,
  wrapHandlers(changePasswordController)
)

export default userRouter
