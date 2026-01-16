import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()
const uri = process.env.MONGO_URI
const client = new MongoClient(uri as string)

export async function run() {
  try {
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    await client.close()
  }
}
