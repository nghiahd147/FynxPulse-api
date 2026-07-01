import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ReactionPostRequest } from '~/models/requests/posts.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import reactionServices from '~/services/reactions.services'
import { REACTION_MESSAGE } from '~/constants/messages'

export const getAllReactionsController = async (req: Request, res: Response) => {
  const result = await reactionServices.getReactions()
  return res.status(HTTP_STATUS.OK).json(result)
}

export const reactionPostController = async (
  req: Request<ParamsDictionary, any, ReactionPostRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization
  const { post_id, type } = req.body
  const result = await reactionServices.reactionToPost(post_id, user_id, type)
  return res.status(HTTP_STATUS.CREATED).json(result)
}

export const unReactionPostController = async (
  req: Request<ParamsDictionary, any, ReactionPostRequest>,
  res: Response
) => {
  const { id } = req.params
  const result = await reactionServices.unReactionToPost(id)
  return res.status(HTTP_STATUS.OK).json(result)
}

export const getReactionsByPostIdController = async (req: Request, res: Response) => {
  const { post_id } = req.params
  const result = await reactionServices.getPostReactions(post_id)
  return res.status(HTTP_STATUS.OK).json({
    message: REACTION_MESSAGE.GET_ALL_REACTIONS_BY_POST_ID_SUCCESS,
    result
  })
}
