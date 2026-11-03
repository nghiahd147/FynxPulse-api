import { config } from 'dotenv'
import argv from 'minimist'

const options = argv(process.argv.slice(2))
console.log(options)
export const isProduction = Boolean(options.production)
config({
  path: options.env ? `.env.${options.env}` : '.env'
})

export const envConfig = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  DB_USER_COLLECTION: process.env.DB_USER_COLLECTION as string,
  DB_HASHTAG_COLLECTION: process.env.DB_HASHTAG_COLLECTION as string,
  DB_POST_COLLECTION: process.env.DB_POST_COLLECTION as string,
  DB_COMMENTS_COLLECTION: process.env.DB_COMMENTS_COLLECTION as string,
  DB_FOLLOWERS_COLLECTION: process.env.DB_FOLLOWERS_COLLECTION as string,
  DB_REACTION_COLLECTION: process.env.DB_REACTION_COLLECTION as string,
  DB_VIDEO_STATUS_COLLECTION: process.env.DB_VIDEO_STATUS_COLLECTION as string,
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTION as string,
  DB_REFRESH_TOKEN_COLLECTION: process.env.DB_REFRESH_TOKEN_COLLECTION as string,
  DB_CONVERSATIONS_COLLECTION: process.env.DB_CONVERSATIONS_COLLECTION as string,
  HOST: process.env.HOST,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_VERIFY_EMAIL: process.env.JWT_SECRET_VERIFY_EMAIL as string,
  JWT_SECRET_FORGOT_PASSWORD: process.env.JWT_SECRET_FORGOT_PASSWORD as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  CLIENT_URL_REDIRECT: process.env.CLIENT_URL_REDIRECT,
  CLIENT_URL: process.env.CLIENT_URL
}
