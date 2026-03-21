import { Request, Response } from 'express'
import { PostRequest } from '~/models/requests/posts.request'
import { ParamsDictionary } from 'express-serve-static-core'
import PostService from '~/services/posts.services'

export const createPostController = async (req: Request<ParamsDictionary, any, PostRequest>, res: Response) => {
  const { user_id } = req.decoded_authorization
  const result = await PostService.createPost(req.body, user_id)
  return res.status(200).json({
    result,
    message: 'Create post successfully'
  })
}
