import { PostRequest } from '~/models/requests/posts.request'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithHandler } from '~/models/Errors'
import { POST_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'

class PostService {
  async createPost(payload: PostRequest, user_id: string) {
    const result = await databaseServices.posts().insertOne(new Post({ ...payload, author_id: user_id }))
    return result
  }
}

const PostServices = new PostService()
export default PostServices
