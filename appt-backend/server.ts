import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { logger } from './services/logger.service';
import { setupSocketAPI } from './services/socket.service';
import { authRoutes } from './api/auth/auth.routes';
import { accountRoutes } from './api/account/account.routes';


const app = express()
const server = http.createServer(app)

const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true
}

app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json()) // for req.body
app.use(express.static('public'))


// routes
app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
setupSocketAPI(server)


const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info(`Server listening on port http://127.0.0.1:${port}/`)
})