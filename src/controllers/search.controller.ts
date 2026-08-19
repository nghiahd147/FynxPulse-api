import { Request, Response } from 'express'
import searchServices from '~/services/search.services'

export const searchController = async (req: Request, res: Response) => {
  const page = Number(req.query.page)
  const page_size = Number(req.query.page_size)
  const result = await searchServices.search({ page, page_size, content: req.query.content as string })
  return res.json({
    result,
    message: 'Search content success'
  })
}
