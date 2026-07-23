import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { POST_MESSAGES, REACTION_MESSAGE } from '~/constants/messages'
import { EmotionTypes } from '~/constants/enum'
import { ErrorWithHandler } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { PostReactionAggregationResult } from '~/models/aggregations/reactions.aggregation'

class ReactionServices {
  async getReactions() {
    const result = await databaseServices.reactions().find().toArray()
    return result
  }

  async reactionToPost(post_id: string, user_id: string, type: EmotionTypes) {
    const result = await databaseServices.reactions().findOneAndUpdate(
      {
        post_id: new ObjectId(post_id),
        user_id: new ObjectId(user_id)
      },
      {
        $set: {
          type
        },
        $setOnInsert: {
          created_at: new Date()
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return {
      result,
      message: POST_MESSAGES.REACTION_ADDED_SUCCESS
    }
  }

  async unReactionToPost(post_id: string, user_id: string) {
    const result = await databaseServices.reactions().deleteOne({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id)
    })

    return {
      result,
      message: REACTION_MESSAGE.REACTION_DELETE_SUCCESS
    }
  }

  async getPostReactions(post_id: string) {
    const emojiPost = await databaseServices
      .posts()
      .aggregate<PostReactionAggregationResult>([
        {
          $match: {
            _id: new ObjectId(post_id)
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'post_id',
            as: 'reaction_childrens'
          }
        },
        {
          $addFields: {
            reaction_total: {
              $size: '$reaction_childrens'
            },
            like_count: {
              $size: {
                $filter: {
                  input: '$reaction_childrens',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 0]
                  }
                }
              }
            },
            heart_count: {
              $size: {
                $filter: {
                  input: '$reaction_childrens',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 1]
                  }
                }
              }
            },
            haha_count: {
              $size: {
                $filter: {
                  input: '$reaction_childrens',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 2]
                  }
                }
              }
            },
            sad_count: {
              $size: {
                $filter: {
                  input: '$reaction_childrens',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 3]
                  }
                }
              }
            },
            wow_count: {
              $size: {
                $filter: {
                  input: '$reaction_childrens',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 4]
                  }
                }
              }
            }
          }
        },
        {
          $addFields: {
            user_like: {
              $filter: {
                input: '$reaction_childrens',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 0]
                }
              }
            },
            user_heart: {
              $filter: {
                input: '$reaction_childrens',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 1]
                }
              }
            },
            user_haha: {
              $filter: {
                input: '$reaction_childrens',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 2]
                }
              }
            },
            user_sad: {
              $filter: {
                input: '$reaction_childrens',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 3]
                }
              }
            },
            user_wow: {
              $filter: {
                input: '$reaction_childrens',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', 4]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_like.user_id',
            foreignField: '_id',
            as: 'user_like'
          }
        },
        {
          $project: {
            user_like: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_heart.user_id',
            foreignField: '_id',
            as: 'user_heart'
          }
        },
        {
          $project: {
            user_heart: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_haha.user_id',
            foreignField: '_id',
            as: 'user_haha'
          }
        },
        {
          $project: {
            user_haha: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_sad.user_id',
            foreignField: '_id',
            as: 'user_sad'
          }
        },
        {
          $project: {
            user_sad: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_wow.user_id',
            foreignField: '_id',
            as: 'user_wow'
          }
        },
        {
          $project: {
            user_wow: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reaction_childrens.user_id',
            foreignField: '_id',
            as: 'user_info_all'
          }
        },
        {
          $project: {
            user_info_all: {
              password: 0,
              email_verify_token: 0,
              verify: 0,
              forgot_password_token: 0,
              role: 0,
              is_active: 0
            }
          }
        },
        {
          $project: {
            reaction_childrens: 0
          }
        }
      ])
      .next()

    if (!emojiPost) {
      throw new ErrorWithHandler({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return {
      post_id,
      reaction_total: emojiPost.reaction_total,
      emoji_info: {
        all: {
          total: emojiPost.reaction_total,
          users: emojiPost.user_info_all
        },
        like: {
          total: emojiPost.like_count,
          users: emojiPost.user_like
        },
        heart: {
          total: emojiPost.heart_count,
          users: emojiPost.user_heart
        },
        haha: {
          total: emojiPost.haha_count,
          users: emojiPost.user_haha
        },
        sad: {
          total: emojiPost.sad_count,
          users: emojiPost.user_sad
        },
        wow: {
          total: emojiPost.wow_count,
          users: emojiPost.user_wow
        }
      }
    }
  }
}

const reactionServices = new ReactionServices()
export default reactionServices
