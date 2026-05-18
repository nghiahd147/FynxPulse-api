import { PostRequest } from '~/models/requests/posts.requests'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'
import { ObjectId } from 'mongodb'

class PostService {
  async createPost(payload: PostRequest, user_id: string) {
    const result = await databaseServices.posts().insertOne(new Post({ ...payload, author_id: new ObjectId(user_id) }))
    return result
  }
}

const PostServices = new PostService()
export default PostServices
