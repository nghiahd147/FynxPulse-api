import { Server } from 'socket.io'
import { ObjectId } from 'mongodb'

import { JwtPayload } from 'jsonwebtoken'
import { verifyAccessToken } from './common'
import { UserVerifyStatus } from '~/constants/enum'
import { ErrorWithHandler } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import databaseServices from '~/services/database.services'
import Conversations from '~/models/schemas/Conversations.schema'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const access_token = socket.handshake.auth.Authorization
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as JwtPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithHandler({
          message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
          status: HTTP_STATUS.FOBIDDEN
        })
      }
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    const { user_id } = socket.handshake.auth.decoded_authorization
    users[user_id] = {
      socket_id: socket.id
    }
    // console.log('connect', socket.id)

    socket.use(async (_, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (err) => {
      if (err.message === 'Unauthorized') {
        console.log('Access Token is expired')
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data: { content: string; receiver_id: string; sender_id: string }) => {
      const receive_user_id = users[data.receiver_id]?.socket_id
      // if (!receive_user_id) {
      //   return
      // }
      const result = await databaseServices.conversations().insertOne(
        new Conversations({
          sender_id: new ObjectId(data.sender_id),
          receiver_id: new ObjectId(data.receiver_id),
          content: data.content as string
        })
      )
      const conversation_id = result.insertedId
      socket.to(receive_user_id).emit('receiver_message', {
        content: data.content,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        _id: conversation_id
      })
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`User ${socket.id} disconnected`)
    })
  })
}

export default initSocket
