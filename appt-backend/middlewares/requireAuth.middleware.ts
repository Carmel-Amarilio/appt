import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service'
import { authService } from '../api/auth/auth.service'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not Authenticated')

    req.loggedinUser = loggedinUser
    next()
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req?.cookies?.loginToken) {
        return res.status(401).send('Not Authenticated')
    }

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser.isAdmin) {
        logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}