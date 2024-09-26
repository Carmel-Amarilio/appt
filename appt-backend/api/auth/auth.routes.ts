import express from 'express'
import { login, logout } from './auth.controller'

export const authRoutes = express.Router()

authRoutes.post('/login', login)
authRoutes.post('/logout', logout)