import { TypeMedia, TypePost } from '~/constants/enum'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'

class SearchServices {
  async searchContentController({
    page,
    page_size,
    content,
    user_id,
    media_type
  }: {
    page: number
    page_size: number
    content: string
    user_id: string
    media_type: number
  }) {
    const filters: any = {
      $text: {
        $search: content
      }
    }
    if (media_type) {
      if (media_type === TypeMedia.Image) {
        filters['medias.type'] = TypeMedia.Image
      }
      if (media_type === TypeMedia.Video) {
        filters['medias.type'] = {
          $in: [TypeMedia.Video, TypeMedia.HLS]
        }
      }
    }
    const [posts, total] = await Promise.all([
      // search content posts
      databaseServices
        .posts()
        .aggregate([
          {
            $match: filters
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
                      'user.fynx_circle': new ObjectId(user_id)
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
            $match: filters
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
                      'user.fynx_circle': new ObjectId(user_id)
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
      total: total[0]?.total
    }
  }
}

const searchServices = new SearchServices()
export default searchServices
