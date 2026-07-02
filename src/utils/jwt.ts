import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  private_key,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  private_key: string
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

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, function (err, decoded) {
      if (err) {
        throw reject(err)
      }

      resolve(decoded as jwt.JwtPayload)
    })
  })
}
