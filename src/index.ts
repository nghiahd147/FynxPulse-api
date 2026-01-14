import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRouter from './routes/users.routes'

dotenv.config()
connectDB()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.use('/api/user', userRouter)

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
