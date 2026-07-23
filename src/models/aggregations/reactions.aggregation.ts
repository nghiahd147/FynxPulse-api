import User from '~/models/schemas/Users.schema'

export interface PostReactionAggregationResult {
  reaction_total: number
  like_count: number
  heart_count: number
  haha_count: number
  sad_count: number
  wow_count: number
  user_like: User[]
  user_heart: User[]
  user_haha: User[]
  user_sad: User[]
  user_wow: User[]
  user_info_all: User[]
}
