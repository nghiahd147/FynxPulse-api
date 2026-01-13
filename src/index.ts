import express from 'express'
import dotenv from 'dotenv'
import connectDB from './services/connect'

dotenv.config()
connectDB()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Home')
})

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
