import User from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'

class UserServices {
  async getListUsers() {
    const result = databaseServices.users().find().toArray()
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
