import { Request, Response } from 'express'
import conversationServices from '~/services/conversations.services'

export const getConversationController = async (req: Request, res: Response) => {
  const { receiver_id } = req.params
  const sender_id = req.decoded_authorization.user_id
  const page = Number(req.query.page)
  const page_size = Number(req.query.page_size)
  const result = await conversationServices.getConversation({ page, page_size, sender_id, receiver_id })
  return res.json({
    result: {
      page,
      page_size,
      total: result.total,
      total_page: Math.ceil(result.total / page_size),
      conversations: result.conversations
    }
  })
}
