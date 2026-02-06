import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { httpStatus } from '~/constants/httpStatus'
import { ErrorWithHandler } from '~/models/Errors'

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req)

    const results = validationResult(req)
    const errorsObject = results.mapped()

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithHandler && msg.status !== httpStatus.Unprocessable_Content) {
        return next(msg)
      }
    }

    if (results.isEmpty()) {
      return next()
    }

    res.status(422).json({ errors: errorsObject })
  }
}
