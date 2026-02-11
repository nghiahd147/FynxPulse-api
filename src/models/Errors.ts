import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'

type TypeError = Record<
  string,
  {
    [key: string]: any
  }
>
export class ErrorWithHandler {
  message
  status
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithHandler {
  errors: TypeError
  constructor({ message = USER_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: TypeError }) {
    super({ message, status: HTTP_STATUS.Unprocessable_Content })
    this.errors = errors
  }
}
