import { Filter } from 'mongodb'
import { RegisterRequest } from '~/models/requests/users.requests'
import User from '~/models/schemas/Users.schema'
import databaseServices from '~/services/database.services'

type FiltesUser = Filter<User>

class UserServices {
  async getList(payload: { page_size: number; currentPage: number; filters: FiltesUser }) {
    const { page_size, currentPage, filters } = payload
    const result = await databaseServices.users().find(filters).skip(currentPage).limit(page_size).toArray()
    return result
  }

  async register(payload: RegisterRequest) {
    const result = await databaseServices
      .users()
      .insertOne(new User({ ...payload, date_of_birth: new Date(payload.date_of_birth) }))
    return result
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users().findOne({ email })
    return Boolean(result)
  }
}

const userServices = new UserServices()
export default userServices
