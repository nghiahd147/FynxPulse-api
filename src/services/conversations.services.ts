import { ObjectId } from 'mongodb'
import databaseServices from './database.services'

class ConversationServices {
  async getConversation({
    page,
    page_size,
    sender_id,
    receiver_id
  }: {
    page: number
    page_size: number
    sender_id: string
    receiver_id: string
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }
    const conversations = await databaseServices
      .conversations()
      .find(match)
      .sort({ created_at: -1 })
      .skip(page_size * (page - 1))
      .limit(page_size)
      .toArray()
    const total = await databaseServices.conversations().countDocuments(match)
    return {
      conversations,
      total
    }
  }
}

const conversationServices = new ConversationServices()
export default conversationServices
