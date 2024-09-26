import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { InvalidLogin } from '../../services/errorMessege.js'

export async function login(req, res) {
    const { phone, password } = req.body
    try {
        const account = await authService.login(phone, password)
        const loginToken = authService.getLoginToken(account)

        logger.info('User login: ', account)
        res.cookie('loginToken', loginToken)
        res.json(account)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        if (err.message === InvalidLogin) res.status(400).json({ error: InvalidLogin })
        else res.status(500).json({ error: 'Failed to Login' });
    }
}


export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}