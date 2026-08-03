import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TypeMedia, PostAudience, TypePost, UserVerifyStatus } from '../constants/enum'
import { PostRequest } from '../models/requests/posts.requests'

import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { RegisterRequest } from '~/models/requests/users.requests'
import User from '~/models/schemas/Users.schema'
import Post from '~/models/schemas/Posts.schema'
import Followers from '~/models/schemas/Followers.chema'

// Mật khẩu cho các fake user
const PASSWORD = 'Nghia2003@'
// ID của tài khoản của mình, dùng để follow người khác
const MYID = new ObjectId('6a0a9646a8b1395d3dd7b947')

// Số lượng user được tạo, mỗi user sẽ mặc định post 2 cái
const USER_COUNT = 300
const POST_HASHTAGS = ['NodeJS', 'MongoDB', 'ExpressJS', 'Swagger', 'Docker', 'Socket.io']

const createRandomUser = () => {
  const user: RegisterRequest = {
    first_name: faker.internet.displayName(),
    last_name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString(),
    avatar: faker.image.avatar()
  }
  return user
}

const createRandomPost = () => {
  const post: PostRequest = {
    type: TypePost.Post,
    audience: PostAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: POST_HASHTAGS,
    medias: [
      {
        type: TypeMedia.Image,
        url: faker.image.url()
      }
    ],
    mentions: [],
    parent_id: null
  }
  return post
}
const users: RegisterRequest[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterRequest[]) => {
  console.log('Creating users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users().insertOne(
        new User({
          ...user,
          _id: user_id,
          user_name: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...')
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      databaseService.followers().insertOne(
        new Followers({
          user_id,
          follower_user_id: new ObjectId(followed_user_id)
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const checkAndCreateHashtags = async (hashtags: string[]): Promise<ObjectId[]> => {
  const hashtagDocuments = await Promise.all(
    [...new Set(hashtags)].map((hashtag) => {
      return databaseService.hashtags().findOneAndUpdate(
        {
          name: hashtag,
          // Ignore the invalid legacy document whose `_id` is null.
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
    })
  )

  return hashtagDocuments.map((hashtag) => {
    if (!hashtag) {
      throw new Error('Failed to create or find hashtag')
    }

    return hashtag._id
  })
}

const insertPost = async (user_id: ObjectId, body: PostRequest, hashtag_ids: ObjectId[]) => {
  const result = await databaseService.posts().insertOne(
    new Post({
      audience: body.audience,
      content: body.content,
      hashtags: hashtag_ids,
      mentions: body.mentions,
      medias: body.medias,
      parent_id: body.parent_id,
      type: body.type,
      author_id: new ObjectId(user_id)
    })
  )
  return result
}

const insertMultiplePosts = async (ids: ObjectId[]) => {
  console.log('Creating posts...')
  console.log(`Counting...`)
  const hashtag_ids = await checkAndCreateHashtags(POST_HASHTAGS)
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        insertPost(id, createRandomPost(), hashtag_ids),
        insertPost(id, createRandomPost(), hashtag_ids)
      ])
      count += 2
      console.log(`Created ${count} posts`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids).catch((err) => {
    console.error('Error when following users')
    console.log(err)
  })
  insertMultiplePosts(ids).catch((err) => {
    console.error('Error when creating posts')
    console.log(err)
  })
})
