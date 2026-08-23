export const USER_MESSAGES = {
  EMAIL_NOT_FOUND: 'Email not found',
  EMAIL_IS_REQUIRED: 'Email is required',
  VALIDATION_ERROR: 'validation error',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_NOT_VALID: 'Access token is not valid',
  EMAIL_IS_EXIST: 'Email is exist',
  EMAIL_INVALID: 'Email is invalid',
  EMAIL_MUST_BE_NOT_EMPTY: 'Email must be not empty',
  FIRST_NAME_MUST_BE_NOT_EMPTY: 'First name must be not empty',
  FIRST_NAME_IS_STRING: 'First name must be a string',
  LAST_NAME_MUST_BE_NOT_EMPTY: 'Last name must be not empty',
  LAST_NAME_IS_STRING: 'Last name must be a string',
  PASSWORD_IS_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_NOT_EMPTY: 'Password must be not empty',
  PASSWORD_STRONG:
    'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  CONFIRM_PASSWORD_IS_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_MUST_BE_NOT_EMPTY: 'Confirm password must be not empty',
  CONFIRM_PASSWORD_STRONG:
    'Confirm password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  CONFIRM_PASSWORD_MATCH: 'Confirm password must match password',
  DATE_OF_BIRTH_MUST_BE_NOT_EMPTY: 'Date of birth must be not empty',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be in ISO8601 format',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_DOES_NOT_EXIST: 'Refresh token does not exist',
  EMAIL_VERIFY_IS_REQUIRED: 'Email verify is required',
  REFRESH_TOKEN_IS_VALID: 'Refresh token is valid',
  LOGOUT_SUCCESS: 'Logout success',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY: 'Email already',
  VERIFY_EMAIL_SUCCESS: 'Verify email success',
  CHECK_EMAIL_FORGOT_PASSWORD_SUCCESS: 'Check email forgot password success',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  GET_ME_SUCCESSFULLY: 'Get me successfully',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify success',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  BIO_IS_STRING: 'Bio must be a string',
  BIO_MUST_BE_BETWEEN_1_AND_500_CHARACTERS: 'Bio must be between 1 and 500 characters',
  LOCATION_IS_STRING: 'Location must be a string',
  LOCATION_MUST_BE_BETWEEN_1_AND_100_CHARACTERS: 'Location must be between 1 and 100 characters',
  WEBSITE_MUST_BE_A_VALID_URL_WITH_PROTOCOL: 'Website must be a valid URL with protocol',
  AVATAR_MUST_BE_A_VALID_URL_WITH_PROTOCOL: 'Avatar must be a valid URL with protocol',
  PROFILE_PICTURE_URL_MUST_BE_A_VALID_URL_WITH_PROTOCOL: 'Profile picture URL must be a valid URL with protocol',
  UPDATE_ME_SUCCESS: 'Update me success',
  GET_PROFILE_USER_SUCCESS: 'Get profile user success',
  FOLLOW_USER_ID_IS_NOT_VALID: 'Follow user id is not valid',
  FOLLOW_USER_SUCCESS: 'Follow user success',
  FOLLOWED: 'You have already followed this user',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow success',
  USER_NAME_INVALID: 'Username invalid',
  GET_USER_FOLLOW_SUCCESS: 'Get user follow success',
  ALREADY_FOLLOWING_THIS_USER: 'Already following this user',
  NOT_FOLLOWING_THIS_USER: 'Not following this user',
  CURRENT_PASSWORD_IS_INCORRECT: 'Current password is incorrect',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  GET_FRIENDS_SUGGESTIONS_SUCCESS: 'Get friends suggestions success',
  GET_LIST_MY_FRIENDS_SUCCESS: 'Get list my friends success',
  GET_LIST_MY_FOLLOWERS_SUCCESS: 'Get list followers success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success'
}

export const POST_MESSAGES = {
  PARENT_ID_IS_VALID: 'Parent id is valid',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING_WITHOUT_HASHTAGS_OR_MENTIONS:
    'Content must be a non empty string without hashtags or mentions',
  PARENT_ID_MUST_BE_NOT_EMPTY: 'Parent id must be not empty',
  AUTHOR_ID_MUST_BE_NOT_EMPTY: 'Author id must be not empty',
  AUTHOR_ID_MUST_BE_STRING: 'Author id must be an string',
  NOT_A_POST_TYPE: 'Not a post type',
  CONTENT_MUST_BE_NOT_EMPTY: 'Content must be not empty',
  CONTENT_MUST_BE_STRING: 'Content must be a string',
  MEDIA_MUST_BE_NOT_EMPTY: 'Media must be not empty',
  NOT_A_MEDIA_TYPE: 'Not a media type',
  AUDIENCE_MUST_BE_NOT_EMPTY: 'Audience must be not empty',
  NOT_AN_AUDIENCE_TYPE: 'Not an audience type',
  GET_POST_DETAIL_SUCCESS: 'Get post detail success',
  POST_NOT_FOUND: 'Post not found',
  GET_POST_BY_AUTHOR_ID_SUCCESS: 'Get post by author id success',
  DELETE_POST_SUCCESS: 'Delete post success',
  REACTION_ADDED_SUCCESS: 'Reaction added success',
  TYPE_IS_A_REQUIRED: 'Type is a required',
  CREATE_POST_SUCCESS: 'Create post success',
  REACTION_DELETE_SUCCESS: 'Delete post success',
  TYPE_MUST_BE_NOT_EMPTY: 'Type must be not empty',
  POST_ID_MUST_BE_A_STRING: 'Post id must be a string',
  POST_ID_IS_REQUIRED: 'Post id is required',
  CONTENT_MUST_BE_AN_EMPTY_STRING: 'Content must be an empty string',
  HASHTAGS_MUST_BE_AN_ARRAY: 'Hashtags must be an array',
  HASHTAGS_MUST_BE_AN_ARRAY_STRING: 'Hashtags must be an array of string',
  HASHTAG_UPSERT_FAILED: 'Unable to create or find hashtag',
  MENTIONS_MUST_BE_AN_ARRAY: 'Mentions must be an array',
  MENTIONS_MUST_BE_AN_ARRAY_OBJECT_ID: 'Mentions must be an array of ObjectId',
  MEDIA_MUST_BE_AN_ARRAY: 'Media must be an array',
  POST_ID_IS_VALID: 'Post id is valid',
  POST_IS_NOT_PUBLIC: 'Post is not public',
  INVALID_POST_TYPE: 'Invalid post type',
  GET_NEW_POSTS_SUCCESS: 'Get new posts success',
  UNDO_REPOST_SUCCESS: 'Undo repost success'
}

export const COMMENT_MESSAGE = {
  GET_DETAIL_COMMENT_SUCCESS: 'Get detail comment success',
  COMMENT_NOT_FOUND: 'Comment not found',
  COMMENT_MUST_BE_A_STRING: 'Comment must be a string',
  COMMENT_IS_NOT_EMPTY: 'Comment is not empty',
  CREATED_COMMENT_SUCCESS: 'Created comment success',
  GET_COMMENTS_BY_POST_ID: 'Get comments by post id success',
  COMMENT_ID_IS_NOT_VALID: 'Comment id is not valid',
  DELETE_COMMENT_SUCCESS: 'Delete comment success'
}

export const MEDIA_MESSAGE = {
  UPLOAD_IMAGE_SUCCESS: 'Upload image success',
  UPLOAD_VIDEO_SUCCESS: 'Upload video success',
  UPLOAD_VIDEO_HLS_SUCCESS: 'Upload video hls success',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status success'
}

export const REACTION_MESSAGE = {
  TYPE_MUST_BE_NOT_EMPTY: 'Type must be not empty',
  NOT_AN_EMOTION_TYPE: 'Not an emotion type',
  REACTION_DELETE_SUCCESS: 'Reaction delete success',
  GET_ALL_REACTIONS_BY_POST_ID_SUCCESS: 'Get all reactions by post id success'
}

export const VIDEO_STATUS_MESSAGE = {
  ENCODED_PENDING: 'Pending',
  ENCODED_PROCESSING: 'Processing',
  ENCODED_SUCCESS: 'Success',
  ENCODED_FAILED: 'Failed'
}

export const BOOKMARK_MESSAGE = {
  CREATE_BOOKMARK_SUCCESSFULLY: 'Create bookmark successfully',
  DELETE_BOOKMARK_SUCCESSFULLY: 'Delete bookmark successfully',
  GET_STATUS_BOOKMARK_SUCCESS: 'Get status bookmark successfully'
}

export const SEARCH_MESSAGE = {
  SEARCH_CONTENT_POST_SUCCESS: 'Search content post successfully'
}
