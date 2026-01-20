import { Request, Response } from 'express'
import userServices from '~/services/users.services'

export const getListUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getListUsers()
    return res.status(200).json({
      data: result,
      message: 'Get all users successfully'
    })
  } catch (error) {
    console.log('Error', error)
    return res.status(400).json({
      message: error
    })
  }
}

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email or password is not defied' })
    }
    const result = await userServices.register({ email, password })
    return res.status(201).json({
      result,
      message: 'Registration successful'
    })
  } catch (error) {
    console.log('error', error)
    return res.status(500).json({
      message: error
    })
  }
}
