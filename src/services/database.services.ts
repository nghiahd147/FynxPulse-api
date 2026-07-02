import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/Users.schema'
import HashTag from '~/models/schemas/Hashtags.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Post from '~/models/schemas/Posts.schema'
import { Comment } from '~/models/schemas/Comment.schema'
import Followers from '~/models/schemas/Followers.chema'
import Reaction from '~/models/schemas/Reaction.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

dotenv.config()
const uri = process.env.MONGO_URI
const db_name = process.env.DB_NAME

class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri as string)
    this.db = this.client.db(db_name)
  }

  indexUsers() {
    this.users().createIndex({email: 1, password: 1})
    this.users().createIndex({email: 1}, {unique: true})
    this.users().createIndex({user_name: 1}, {unique: true})
  }

  indexRefreshToken() {
    this.refreshToken().createIndex({token: 1})
    this.refreshToken().createIndex({exp: 1}, {expireAfterSeconds: 0})
  }

  indexPost() {
    this.posts().createIndex({author_id: 1})
  }

  indexComment() {
    this.comments().createIndex({created_at: 1})
    this.comments().createIndex({content: 1})
    this.comments().createIndex({post_id: 1})
  }

  indexFollowers() {
    this.followers().createIndex({user_id: 1})
    this.followers().createIndex({follower_user_id: 1})
    this.followers().createIndex({user_id: 1, follower_user_id: 1})
  }

  indexHashTag() {
    this.hashtags().createIndex({name: 1})
  }

  users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }

  posts(): Collection<Post> {
    return this.db.collection(process.env.DB_POST_COLLECTION as string)
  }

  hashtags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string)
  }

  refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }

  comments(): Collection<Comment> {
    return this.db.collection(process.env.DB_COMMENTS_COLLECTION as string)
  }

  followers(): Collection<Followers> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  reactions(): Collection<Reaction> {
    return this.db.collection(process.env.DB_REACTION_COLLECTION as string)
  }

  videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log(`Pinged your deployment. You successfully connected to MongoDB ${db_name}!`)
    } catch (error) {
      console.log('error', error)
      throw error
    }
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
