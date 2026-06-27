import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/Users.schema'
import HashTag from '~/models/schemas/Hashtags.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Post from '~/models/schemas/Posts.schema'
import { Comment } from '~/models/schemas/Comment.schema'
import Followers from '~/models/schemas/Followers.chema'
import Reaction from '~/models/schemas/Reaction.schema'

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
