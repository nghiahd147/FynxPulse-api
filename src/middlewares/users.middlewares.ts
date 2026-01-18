import { Request, Response, NextFunction } from 'express'

export const usersValidation = (req: Request, res: Response, next: NextFunction) => {
  const { email, pass } = req.body
  if (!email || !pass) {
    return res.status(400).json({ message: 'Email or Pass is not defied' })
  }
  next()
}
