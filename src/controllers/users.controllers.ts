import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
import userServices from '~/services/users.services'

export const getUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10)
    const page_size = parseInt((req.query.page_size as string) || '10', 10)
    const currentPage = (page - 1) * page_size

    const filters = {}
    const searchParams = req.query.search as string | undefined
    const verifyStatus = req.query.verify as string | undefined
    const isActive = req.query.is_active as string | undefined
    const role = req.query.role as string | undefined

    if (role) {
      Object.assign(filters, { role })
    }

    if (isActive) {
      Object.assign(filters, { is_active: isActive })
    }

    if (verifyStatus) {
      Object.assign(filters, { verify: verifyStatus })
    }

    if (searchParams) {
      Object.assign(filters, {
        email: { $regex: searchParams, $options: 'i' }
      })
    }

    const users = await userServices.getList({ page_size, currentPage, filters })
    const totalUsers = await databaseServices.users().countDocuments()

    return res.status(200).json({
      data: users,
      total: totalUsers,
      page,
      page_size
    })
  } catch (error) {
    console.log('error', error)
    return res.status(500).json({
      message: error
    })
  }
}

export const getDetailUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: 'User is not found!' })
    }

    res.status(200).json({
      data: user
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}

export const bandUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: 'User is not found!' })
    }

    const userBand = await databaseServices
      .users()
      .updateOne({ _id: new ObjectId(userId) }, { $set: { verify: UserVerifyStatus.Banned, is_active: false } })

    res.status(200).json({
      data: userBand,
      message: 'Band user successfully'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}

export const unBandUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: 'User is not found!' })
    }

    const userBand = await databaseServices
      .users()
      .updateOne({ _id: new ObjectId(userId) }, { $set: { verify: UserVerifyStatus.Verified, is_active: true } })

    res.status(200).json({
      data: userBand,
      message: 'Band user successfully'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}

export const switchRoleUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: 'User is not defied' })
    }

    const userSwitch = await databaseServices.users().updateOne({ _id: new ObjectId(userId) }, { $set: { role: role } })

    res.status(200).json({
      data: userSwitch,
      message: 'Switch user successfully'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await databaseServices.users().findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return res.status(404).json({ message: 'User is not defied' })
    }

    res.status(204).json({
      message: 'Deleted user successfully'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, password, date_of_birth } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email or password is not defied' })
    }
    const result = await userServices.register({ email, first_name, last_name, password, date_of_birth })
    res.status(201).json({
      result,
      message: 'Registration successful'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: error
    })
  }
}
