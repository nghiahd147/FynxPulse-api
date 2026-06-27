import { EmotionTypes, PostAudience, TypePost } from '~/constants/enum'

export interface PostRequest {
  author_id: string
  type: TypePost
  content: string
  audience: PostAudience
}

export interface ReactionPostRequest {
  post_id: string
  type: EmotionTypes
}