import { Request, Response } from 'express';
import { authService } from './auth.service';
import { logger } from '../../services/logger.service';
import { InvalidLogin } from '../../services/errorMessege';

export async function login(req: Request, res: Response): Promise<void> {
    const { phone, password } = req.body as { phone: string; password: string };

    try {
        const account = await authService.login(phone, password);
        const loginToken = authService.getLoginToken(account);

        logger.info('User login: ', account);
        res.cookie('loginToken', loginToken);
        res.json(account);
    } catch (err: any) {
        logger.error('Failed to Login ' + err);
        if (err.message === InvalidLogin) res.status(400).json({ error: InvalidLogin });
        else res.status(500).json({ error: 'Failed to Login' });
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    try {
        res.clearCookie('loginToken');
        res.send({ msg: 'Logged out successfully' });
    } catch (err: any) {
        res.status(500).send({ err: 'Failed to logout' });
    }
}
