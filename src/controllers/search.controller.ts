import { Request, Response } from 'express'
import { SEARCH_MESSAGE } from '~/constants/messages'
import searchServices from '~/services/search.services'

export const searchController = async (req: Request, res: Response) => {
  const page = Number(req.query.page)
  const page_size = Number(req.query.page_size)
  const result = await searchServices.searchContentController({
    page,
    page_size,
    content: req.query.content as string,
    user_id: req.decoded_authorization.user_id
  })
  return res.json({
    result: {
      data: result.posts,
      page,
      page_size,
      total_page: Math.ceil(result.total / page_size),
      total: result.total
    },
    message: SEARCH_MESSAGE.SEARCH_CONTENT_POST_SUCCESS
  })
}
