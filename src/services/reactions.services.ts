import { ObjectId, WithId } from 'mongodb'
import databaseServices from './database.services'
import { POST_MESSAGES, REACTION_MESSAGE } from '~/constants/messages'
import { EmotionTypes } from '~/constants/enum'
import Reaction from '~/models/schemas/Reaction.schema'

class ReactionServices {
  async getReactions() {
    const result = await databaseServices.reactions().find().toArray()
    return result
  }

  async reactionToPost(post_id: string, user_id: string, type: EmotionTypes) {
    await databaseServices.posts().updateOne(
      {
        _id: new ObjectId(post_id)
      },
      {
        $inc: { like_count: 1 }
      }
    )
    const result = await databaseServices.reactions().insertOne(
      new Reaction({
        user_id: new ObjectId(user_id),
        post_id: new ObjectId(post_id),
        type,
        created_at: new Date()
      })
    )
    return {
      result,
      message: POST_MESSAGES.REACTION_ADDED_SUCCESS
    }
  }

  async unReactionToPost(post_id: string, user_id: string) {
    await databaseServices.posts().updateOne(
      {
        _id: new ObjectId(post_id)
      },
      {
        $inc: { like_count: -1 }
      }
    )
    await databaseServices.reactions().deleteOne({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id),
    })
    return {
      message: REACTION_MESSAGE.REACTION_DELETE_SUCCESS
    }
  }

  async getPostReactions(post_id: string) {
    const post = await databaseServices.posts().findOne({ _id: new ObjectId(post_id) })
    const emoji_post = await databaseServices
      .reactions()
      .find({ post_id: new ObjectId(post_id) })
      .toArray()
    let emoji_into_total: {
      emoji_like: WithId<Reaction>[]
      emoji_heart: WithId<Reaction>[]
      emoji_haha: WithId<Reaction>[]
      emoji_sad: WithId<Reaction>[]
      emoji_wow: WithId<Reaction>[]
    } = {
      emoji_like: [],
      emoji_heart: [],
      emoji_haha: [],
      emoji_sad: [],
      emoji_wow: []
    }
    emoji_post.map((item, index) => {
      if (item.type === 0) {
        emoji_into_total.emoji_like.push(item)
      } else if (item.type === 1) {
        emoji_into_total.emoji_heart.push(item)
      } else if (item.type === 2) {
        emoji_into_total.emoji_haha.push(item)
      } else if (item.type === 3) {
        emoji_into_total.emoji_sad.push(item)
      } else {
        emoji_into_total.emoji_wow.push(item)
      }
    })
    const user_info_emoji_like = await Promise.all(
      emoji_into_total.emoji_like.map((item) => {
        return databaseServices.users().findOne({ _id: item.user_id })
      })
    )
    const user_info_emoji_heart = await Promise.all(
      emoji_into_total.emoji_heart.map((item) => {
        return databaseServices.users().findOne({ _id: item.user_id })
      })
    )
    const user_info_emoji_haha = await Promise.all(
      emoji_into_total.emoji_haha.map((item) => {
        return databaseServices.users().findOne({ _id: item.user_id })
      })
    )
    const user_info_emoji_sad = await Promise.all(
      emoji_into_total.emoji_sad.map((item) => {
        return databaseServices.users().findOne({ _id: item.user_id })
      })
    )
    const user_info_emoji_wow = await Promise.all(
      emoji_into_total.emoji_wow.map((item) => {
        return databaseServices.users().findOne({ _id: item.user_id })
      })
    )
    return {
      reaction_total: post?.like_count,
      emoji_info: {
        like: {
          total: emoji_into_total.emoji_like.length,
          users: user_info_emoji_like
        },
        heart: {
          total: emoji_into_total.emoji_heart.length,
          users: user_info_emoji_heart
        },
        haha: {
          total: emoji_into_total.emoji_haha.length,
          users: user_info_emoji_haha
        },
        sad: {
          total: emoji_into_total.emoji_sad.length,
          users: user_info_emoji_sad
        },
        wow: {
          total: emoji_into_total.emoji_wow.length,
          users: user_info_emoji_wow
        }
      }
    }
  }
}

const reactionServices = new ReactionServices()
export default reactionServices
