import { PostRequest } from '~/models/requests/posts.request'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'

class PostService {
  async createPost(payload: PostRequest, user_id: string) {
    const result = await databaseServices
      .posts()
      .insertOne(new Post({ ...payload, author_id: user_id, created_at: new Date(), updated_at: new Date() }))
    return result
  }
}

const PostServices = new PostService()
export default PostServices
