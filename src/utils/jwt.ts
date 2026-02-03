import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  private_key = process.env.JWT_SECRET as string,
  options = { algorithm: 'ES256' }
}: {
  payload: string | object | Buffer
  private_key?: string
  options?: jwt.SignOptions
}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, private_key, options, function (err, token) {
      if (err) {
        reject(err)
      }

      resolve(token)
    })
  })
}
