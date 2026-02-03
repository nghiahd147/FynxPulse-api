import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import databaseServices from '~/services/database.services'
import hashTagServices from '~/services/hashtags.services'

export const getHashTagsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10)
    const page_size = parseInt((req.query.page_size as string) || '10', 10)
    const skip = (page - 1) * page_size

    const filters = {}
    const search = req.query.search || ''

    if (search) {
      Object.assign(filters, { name: { $regex: search, $options: 'i' } })
    }

    const hashTags = await hashTagServices.getListHashTag(filters, skip, page_size)
    const totalHashTag = await databaseServices.hashtags().countDocuments()

    res.status(200).json({
      data: hashTags,
      total: totalHashTag,
      page,
      page_size
    })
  } catch (error) {
    console.log('Error', error)
    res.status(500).json({
      message: 'Internal Server Error'
    })
  }
}

export const getDetailHashTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const hashTag = await databaseServices.hashtags().findOne({ _id: new ObjectId(id) })

    if (!hashTag) {
      return res.status(404).json({ message: 'Hashtag is not found !' })
    }

    res.status(200).json({
      data: hashTag,
      message: 'Get hashtag successfully'
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({
      message: 'Internal Server Error'
    })
  }
}
