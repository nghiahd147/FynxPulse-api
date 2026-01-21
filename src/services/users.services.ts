import { UserFilters } from '~/controllers/users.controllers'
import User from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'

class UserServices {
  async getListUsers(filter: UserFilters) {
    const result = databaseServices
      .users()
      .find({ email: { $regex: filter.email, $options: 'i' } })
      .toArray()
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
