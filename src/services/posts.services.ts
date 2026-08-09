import { PostRequest } from '~/models/requests/posts.requests'
import databaseServices from './database.services'
import Post from '~/models/schemas/Posts.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithHandler } from '~/models/Errors'
import { POST_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TypePost } from '~/constants/enum'

class PostService {
  private async checkHashtagAndCreate(hashtags: string[]): Promise<ObjectId[]> {
    return Promise.all(
      [...new Set(hashtags)].map(async (hashtag) => {
        const hashtagDocument = await databaseServices.hashtags().findOneAndUpdate(
          {
            name: hashtag,
            _id: { $type: 'objectId' }
          },
          {
            $setOnInsert: {
              name: hashtag,
              created_at: new Date(),
              updated_at: new Date()
            }
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )

        if (!hashtagDocument) {
          throw new ErrorWithHandler({
            message: POST_MESSAGES.HASHTAG_UPSERT_FAILED,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        }

        return hashtagDocument._id
      })
    )
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

  async getPostByAuthor({
    author_id,
    user_id,
    page,
    page_size
  }: {
    author_id: string
    user_id?: string
    page: number
    page_size: number
  }) {
    const posts = (await databaseServices
      .posts()
      .aggregate([
        {
          $match: {
            author_id: new ObjectId(author_id)
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'parent_id',
            foreignField: '_id',
            as: 'parent_id'
          }
        },
        {
          $unwind: {
            path: '$parent_id',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'parent_id.author_id', // hoặc parent.user nếu field tên là user
            foreignField: '_id',
            as: 'user_info_parent',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  first_name: 1,
                  last_name: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: '$user_info_parent',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'post_children_count'
          }
        },
        {
          $addFields: {
            post_children_count: {
              $size: '$post_children_count'
            }
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'post_id',
            as: 'reaction_count'
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'post_id',
            as: 'comment_count'
          }
        },
        {
          $addFields: {
            views: {
              $add: ['$guest_views', '$user_views']
            }
          }
        },
        {
          $addFields: {
            reaction_count: {
              $size: '$reaction_count'
            },
            comment_count: {
              $size: '$comment_count'
            }
          }
        },
        {
          $skip: page_size * (page - 1)
        },
        {
          $limit: page_size
        }
      ])
      .sort({ created_at: -1 })
      .toArray()) as Post[]
    const date = new Date()
    const ids = posts.map((post) => post._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    await databaseServices.posts().updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )
    posts.forEach((post) => {
      post.updated_at = date
      if (user_id) {
        post.user_views = Number(post.user_views) + 1
      } else {
        post.guest_views = Number(post.guest_views) + 1
      }
    })
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
          updated_at: 0,
          verify: 0
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
    const total = await databaseServices.posts().countDocuments({
      author_id: new ObjectId(author_id)
    })
    return {
      page,
      page_size,
      total_page: Math.ceil(total / page_size),
      total,
      data: result
    }
  }

  // async getDetailPost(post_id: string) {
  //   const result = await databaseServices
  //     .posts()
  //     .aggregate([
  //       {
  //         $match: {
  //           _id: new ObjectId(post_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'posts',
  //           localField: '_id',
  //           foreignField: 'parent_id',
  //           as: 'post_childrens'
  //         }
  //       },
  //       {
  //         $addFields: {
  //           repost_count: {
  //             $size: {
  //               $filter: {
  //                 input: '$post_childrens',
  //                 as: 'item',
  //                 cond: {
  //                   $eq: ['$$item.type', 1]
  //                 }
  //               }
  //             }
  //           },
  //           commentpost_count: {
  //             $size: {
  //               $filter: {
  //                 input: '$post_childrens',
  //                 as: 'item',
  //                 cond: {
  //                   $eq: ['$$item.type', 2]
  //                 }
  //               }
  //             }
  //           },
  //           qoutepost_count: {
  //             $size: {
  //               $filter: {
  //                 input: '$post_childrens',
  //                 as: 'item',
  //                 cond: {
  //                   $eq: ['$$item.type', 3]
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $addFields: {
  //           views: {
  //             $add: ['$guest_views', '$user_views']
  //           }
  //         }
  //       },
  //       {
  //         $project: {
  //           post_childrens: 0
  //         }
  //       }
  //     ])
  //     .toArray()
  //   return result
  // }

  async getCommentPostChildren({
    post_id,
    post_type,
    page,
    page_size
  }: {
    post_id: string
    post_type: TypePost
    page: number
    page_size: number
  }) {
    const posts = await databaseServices
      .posts()
      .aggregate<Post>([
        {
          $match: {
            parent_id: new ObjectId(post_id),
            type: post_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'post_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'post_id',
            as: 'reactions'
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'post_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            reactions: {
              $size: '$reactions'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.Repost]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.QuotePost]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: page_size * (page - 1)
        },
        {
          $limit: page_size
        }
      ])
      .toArray()
    const total = await databaseServices.posts().countDocuments({
      parent_id: new ObjectId(post_id),
      type: post_type
    })
    return {
      result: posts,
      page,
      page_size,
      total,
      total_page: Math.ceil(total / page_size)
    }
  }

  async getPostChildren({
    post_id,
    post_type,
    page,
    page_size,
    user_id
  }: {
    post_id: string
    post_type: TypePost
    page: number
    page_size: number
    user_id?: string
  }) {
    const posts = await databaseServices
      .posts()
      .aggregate<Post>([
        {
          $match: {
            parent_id: new ObjectId(post_id),
            type: post_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'post_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'post_id',
            as: 'reactions'
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'post_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            reactions: {
              $size: '$reactions'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.Repost]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$post_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TypePost.QuotePost]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: page_size * (page - 1)
        },
        {
          $limit: page_size
        }
      ])
      .toArray()
    const ids = posts.map((post) => post._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    await databaseServices.posts().updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )
    posts.forEach((post) => {
      post.updated_at = date
      if (user_id) {
        post.user_views = Number(post.user_views) + 1
      } else {
        post.guest_views = Number(post.guest_views) + 1
      }
    })
    const total = await databaseServices.posts().countDocuments({
      parent_id: new ObjectId(post_id),
      type: post_type
    })
    return {
      result: posts,
      page,
      page_size,
      total,
      total_page: Math.ceil(total / page_size)
    }
  }

  async incrementView(post_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseServices.posts().findOneAndUpdate(
      {
        _id: new ObjectId(post_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
    return result
  }

  async deletePost(post_id: string) {
    const post = await databaseServices.posts().findOne({ _id: new ObjectId(post_id) })

    if (!post) {
      throw new ErrorWithHandler({
        message: POST_MESSAGES.POST_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseServices.posts().deleteOne({ _id: new ObjectId(post_id) })

    return {
      message: POST_MESSAGES.DELETE_POST_SUCCESS
    }
  }

  async getNewPosts({ user_id, page, page_size }: { user_id: string; page: number; page_size: number }) {
    const followers = await databaseServices
      .followers()
      .find(
        {
          user_id: new ObjectId(user_id)
        },
        {
          projection: {
            follower_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followers.map((item) => item.follower_user_id)
    ids.push(new ObjectId(user_id))
    const [posts, total] = await Promise.all([
      // new post
      databaseServices
        .posts()
        .aggregate([
          {
            $match: {
              author_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'author_id',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    avatar: 1,
                    post_circle: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.fynx_circle': {
                        $in: ids
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $lookup: {
              from: 'posts',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'post_childrens'
            }
          },
          {
            $addFields: {
              repost_count: {
                $size: {
                  $filter: {
                    input: '$post_childrens',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TypePost.Repost]
                    }
                  }
                }
              },
              commentpost_count: {
                $size: {
                  $filter: {
                    input: '$post_childrens',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TypePost.Comment]
                    }
                  }
                }
              },
              qoutepost_count: {
                $size: {
                  $filter: {
                    input: '$post_childrens',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TypePost.QuotePost]
                    }
                  }
                }
              }
            }
          },
          {
            $addFields: {
              views: {
                $add: ['$guest_views', '$user_views']
              }
            }
          },
          {
            $project: {
              post_childrens: 0
            }
          },
          {
            $skip: page_size * (page - 1)
          },
          {
            $limit: page_size
          }
        ])
        .toArray(),
      // total
      databaseServices
        .posts()
        .aggregate([
          {
            $match: {
              author_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'author_id',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    avatar: 1,
                    post_circle: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.fynx_circle': {
                        $in: ids
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const date = new Date()
    const post_ids = posts.map((post) => post._id as ObjectId)
    await databaseServices.posts().updateMany(
      {
        _id: {
          $in: post_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )
    posts.forEach((post) => {
      post.updated_at = date
      post.user_views = Number(post.user_views) + 1
    })
    return {
      posts,
      total: total[0].total
    }
  }
}

const postServices = new PostService()
export default postServices
