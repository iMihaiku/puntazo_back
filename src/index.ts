import { Server } from '@/lib/server.logs'
import userRouter from '@/infrastructure/user/routes/router'
import express from 'express'
import cookieParser from 'cookie-parser'
import paymentRouter from '@/infrastructure/payment/routes/router'
import cors from 'cors'

const app = express()
const port = 8080

app.use(
  cors({
    origin: 'http://localhost:3000', // Permite cualquier origen
    methods: 'GET,POST,PUT,DELETE', // Permite estos métodos
    allowedHeaders: 'Content-Type,Authorization,Cookie',
    credentials: true
  })
)

app.use(express.json())
app.use(cookieParser())
app.use('/users', userRouter)
app.use('/payment', paymentRouter)

app.listen(port, () => {
  Server.log(`Server on ==> http://localhost:${port}`)
})

export default app
