import { Comment } from "~/models/schemas/Comment.schema"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"

class CommentServices {
    async createComment({user_id, post_id, content}: {user_id: string, post_id: string, content: string}) {
        await databaseServices.comments().insertOne(new Comment({
            author_id: new ObjectId(user_id),
            post_id: new ObjectId(post_id),
            content,
        }))
        return true
    }

    async getCommentsPost(post_id: string) {
        const result = await databaseServices.comments().find({post_id: new ObjectId(post_id)}).toArray()
        return result
    }
}

const commentServices = new CommentServices()
export default commentServices
