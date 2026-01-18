import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()
const uri = process.env.MONGO_URI

class DatabaseServices {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(uri as string)
  }

  async connect() {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      await this.client.close()
    }
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
