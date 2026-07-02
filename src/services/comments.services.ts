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
        await databaseServices.posts().updateOne({
            _id: new ObjectId(post_id),
        }, {
            $inc: {comment_count: 1}
        })
        return true
    }

    async getCommentsPost(post_id: string) {
        const result = await databaseServices.comments().find({post_id: new ObjectId(post_id)}).toArray()
        return result
    }

    async getCommentDetail(id: string) {
        const comment = await databaseServices.comments().findOne({_id: new ObjectId(id)})
        const infoUser = await databaseServices.users().findOne({_id: comment?.author_id}, {projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            role: 0,
            is_active: 0,
            created_at: 0,
            updated_at: 0
        }})
        const result = {...comment, author_id: infoUser}
        return result
    }
}

const commentServices = new CommentServices()
export default commentServices
