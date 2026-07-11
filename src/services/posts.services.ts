import { PostRequest } from '~/models/requests/posts.requests'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithHandler } from '~/models/Errors'
import { POST_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'

class PostService {
  private async checkHashtagAndCreate(hashtags: string[]) {
    const result = await Promise.all(
      hashtags.map((hahstag) => {
        return databaseServices.hashtags().findOneAndUpdate(
          {
            name: hahstag
          },
          {
            $setOnInsert: {
              name: hahstag,
              created_at: new Date()
            }
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return result.map((item) => item!._id)
  }
  async createPost(payload: PostRequest, user_id: string) {
    const hashtags = await this.checkHashtagAndCreate(payload.hashtags)
    const newPost = await databaseServices.posts().insertOne(
      new Post({
        author_id: new ObjectId(user_id),
        type: payload.type,
        content: payload.content,
        medias: payload.medias,
        audience: payload.audience,
        parent_id: payload.parent_id,
        hashtags,
        mentions: payload.mentions
      })
    )
    const result = await databaseServices.posts().findOne({ _id: newPost.insertedId })
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
        const has_reaction = await databaseServices
          .reactions()
          .find({
            post_id: item._id
          })
          .toArray()
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
