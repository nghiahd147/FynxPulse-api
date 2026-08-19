import databaseServices from './database.services'

class SearchServices {
  async search({ page, page_size, content }: { page: number; page_size: number; content: string }) {
    const result = await databaseServices
      .posts()
      .find({ $text: { $search: content } })
      .limit(page_size)
      .skip(page_size * (page - 1))
      .toArray()
    return result
  }
}

const searchServices = new SearchServices()
export default searchServices
