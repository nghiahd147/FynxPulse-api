import { Filter, ObjectId } from 'mongodb'
import { TypeToken } from '~/constants/enum'
import { RegisterRequest } from '~/models/requests/users.requests'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/Users.schema'
import databaseServices from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'

type FiltesUser = Filter<User>

class UserServices {
  async getList(payload: { page_size: number; currentPage: number; filters: FiltesUser }) {
    const { page_size, currentPage, filters } = payload
    const result = await databaseServices.users().find(filters).skip(currentPage).limit(page_size).toArray()
    return result
  }

  async signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.AcessToken
      },
      options: {
        expiresIn: '15m'
      }
    })
  }

  async signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type_token: TypeToken.RefreshToken
      },
      options: {
        expiresIn: '100d'
      }
    })
  }

  private signAccessAndRefreshToken(id: string) {
    return Promise.all([this.signAccessToken(id), this.signRefreshToken(id)])
  }

  async register(payload: RegisterRequest) {
    const result = await databaseServices.users().insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()

    const [acessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id)
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken as string }))
    return {
      acessToken,
      refreshToken
    }
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users().findOne({ email })
    return Boolean(result)
  }

  async login(user_id: string) {
    const [acessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id)
    databaseServices
      .refreshToken()
      .insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken as string }))
    return {
      acessToken,
      refreshToken
    }
  }
}

const userServices = new UserServices()
export default userServices
