import { Filter } from 'mongodb'
import HashTag from '~/models/schemas/Hashtags.schema'
import databaseServices from './database.services'

type FiltersHashTag = Filter<HashTag>
class HashTagServices {
  async getListHashTag(filters: FiltersHashTag, skip: number, page_size: number) {
    const result = await databaseServices.hashtags().find(filters).skip(skip).limit(page_size).toArray()
    return result
  }
}

const hashTagServices = new HashTagServices()
export default hashTagServices
