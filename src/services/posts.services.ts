import { PostRequest } from '~/models/requests/posts.requests'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithHandler } from '~/models/Errors'
import { POST_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'

class PostService {
  async createPost(payload: PostRequest, user_id: string) {
    const result = await databaseServices.posts().insertOne(new Post({ ...payload, author_id: new ObjectId(user_id) }))
    return result
  }

  async getPostByAuthor(author_id: string) {
    const result = await databaseServices.posts().find({author_id: new ObjectId(author_id)}).sort({created_at: -1}).toArray()
    return result
  }

  async deletePost(id: string) {
    const post = await databaseServices.posts().findOne({ _id: new ObjectId(id) })

    if (!post) {
      throw new ErrorWithHandler({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseServices.posts().deleteOne({ _id: new ObjectId(id) })

    return {
      message: POST_MESSAGES.DELETE_POST_SUCCESS
    }
  }
}

const postServices = new PostService()
export default postServices
