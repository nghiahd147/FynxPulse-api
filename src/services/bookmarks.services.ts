import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { ErrorWithHandler } from '~/models/Errors'

class BookmarksService {
  async createBookmarks(user_id: string, post_id: string) {
    const result = await databaseServices.bookMarks().findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        post_id: new ObjectId(post_id)
      },
      {
        $setOnInsert: {
          user_id: new ObjectId(user_id),
          post_id: new ObjectId(post_id),
          created_at: new Date()
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async deleteBookmark(user_id: string, post_id: string) {
    await databaseServices.bookMarks().findOneAndDelete({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id)
    })
    return true
  }

  async getStatus(user_id: string, post_id: string) {
    const currentStatus = await databaseServices.bookMarks().findOne({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id)
    })
    return currentStatus ? true : false
  }
}

const bookmarksServices = new BookmarksService()
export default bookmarksServices
