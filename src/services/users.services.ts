import { Filter } from 'mongodb'
import User from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'

type FiltesUser = Filter<User>

class UserServices {
  async getList(payload: { page_size: number; currentPage: number; filters: FiltesUser }) {
    const { page_size, currentPage, filters } = payload
    const result = await databaseServices.users().find(filters).skip(currentPage).limit(page_size).toArray()
    return result
  }

  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await databaseServices.users().insertOne(new User({ email, password }))
    return result
  }
}

const userServices = new UserServices()
export default userServices
