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
    const posts = await databaseServices
      .posts()
      .find({ author_id: new ObjectId(author_id) })
      .sort({ created_at: -1 })
      .toArray()
    const user_info = await databaseServices.users().findOne(
      { _id: new ObjectId(author_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          role: 0,
          is_active: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    const result = await Promise.all(
      posts.map(async (item) => {
        const has_reaction = await databaseServices.reactions().findOne({
          post_id: item._id,
          user_id: user_info?._id
        })
        return { ...item, user_info, has_reaction }
      })
    )
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
