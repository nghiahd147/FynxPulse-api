import { NextFunction, Request, Response } from 'express'
import { httpStatus } from '~/constants/httpStatus'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status || httpStatus.Internal_Server_Error).json({ message: err.message })
}
