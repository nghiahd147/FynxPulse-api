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

  async register(payload: {
    email: string
    first_name: string
    last_name: string
    password: string
    date_of_birth: string
  }) {
    const { email, first_name, last_name, password, date_of_birth } = payload
    const result = await databaseServices
      .users()
      .insertOne(new User({ email, first_name, last_name, password, date_of_birth }))
    return result
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users().findOne({ email })
    return Boolean(result)
  }
}

const userServices = new UserServices()
export default userServices
