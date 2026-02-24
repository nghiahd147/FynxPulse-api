import { Filter, ObjectId } from 'mongodb'
import HashTag from '~/models/schemas/Hashtags.schema'
import databaseServices from './database.services'
import { CreateHashTagRequest } from '~/models/requests/hashtag.request'

type FiltersHashTag = Filter<HashTag>
class HashTagServices {
  async getListHashTag(filters: FiltersHashTag, skip: number, page_size: number) {
    const result = await databaseServices.hashtags().find(filters).skip(skip).limit(page_size).toArray()
    return result
  }

  async getDetailHashTag(id: string) {
    const result = await databaseServices.hashtags().findOne({ _id: new ObjectId(id) })
    return Boolean(result)
  }

  async checkNameHashTag(nameTag: string) {
    const result = await databaseServices.hashtags().findOne({ name: nameTag })
    return Boolean(result)
  }

  async createHashTag(payload: CreateHashTagRequest) {
    const result = await databaseServices.hashtags().insertOne(
      new HashTag({
        ...payload,
        created_at: new Date(payload.created_at),
        update_at: new Date(payload.update_at)
      })
    )

    return result
  }

  async updateHashTag(id: string, name: string) {
    const result = await databaseServices
      .hashtags()
      .updateOne({ _id: new ObjectId(id) }, { $set: { name: name, update_at: new Date() } })
    return result
  }

  async deleteHashTag(id: string) {
    const result = await databaseServices.hashtags().deleteOne({ _id: new ObjectId(id) })
    return result
  }
}

const hashTagServices = new HashTagServices()
export default hashTagServices
