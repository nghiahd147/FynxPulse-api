import mongoose from 'mongoose'

const hashtagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

const Hashtag = mongoose.model('Hashtag', hashtagSchema)

export default Hashtag
