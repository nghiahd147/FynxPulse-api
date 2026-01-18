import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/users.routes'
import databaseServices from './services/database.services'

dotenv.config()
databaseServices.connect()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.use('/api/user', userRouter)

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
