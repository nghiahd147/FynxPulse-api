export class ErrorWithHandler {
  message
  status
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}
