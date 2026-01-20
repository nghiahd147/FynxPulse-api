import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import HashTag from '~/models/schemas/Hashtag.schema'

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

  hashtags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string)
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
