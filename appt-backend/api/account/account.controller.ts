import { Request, Response } from 'express'
import { Account, Appt } from "../../models/models"
import { apptTaken } from "../../services/errorMessege"
import { logger } from "../../services/logger.service"
import { socketService } from "../../services/socket.service"
import { authService } from "../auth/auth.service"
import { accountService } from "./account.service"



export async function getAccounts(req: Request, res: Response): Promise<void> {
    try {
        const filterBy = {
            bizName: req.query.bizName as string || '',
            page: Number(req.query.page) || 0,
        }
        logger.debug('Getting Accounts', filterBy)
        const accounts = await accountService.query(filterBy)
        res.json(accounts)
    } catch (err) {
        logger.error('Failed to get accounts', err)
        res.status(500).send({ err: 'Failed to get accounts' })
    }
}

export async function getAccountById(req: Request, res: Response): Promise<void> {
    try {
        const accountId = req.params.id
        const account = await accountService.getById(accountId)
        res.json(account)
    } catch (err) {
        logger.error('Failed to get account', err)
        res.status(500).send({ err: 'Failed to get account' })
    }
}

export async function addAccount(req: Request, res: Response): Promise<void> {
    try {
        const account: Account = req.body
        const { phone, password } = account
        const addedAccount = await accountService.add(account)
        if (!password) throw new Error('Password is required')
        const user = await authService.login(phone, password)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)

        res.json(addedAccount)
    } catch (err) {
        logger.error('Failed to add account', err)
        res.status(500).send({ err: 'Failed to add account' })
    }
}

export async function updateAccount(req: Request, res: Response): Promise<void> {
    try {
        const account: Account = req.body
        const updatedAccount = await accountService.update(account)
        res.json(updatedAccount)
    } catch (err) {
        logger.error('Failed to update account', err)
        res.status(500).send({ err: 'Failed to update account' })
    }
}

export async function removeAccount(req: Request, res: Response): Promise<void> {
    // const { loggedinUser } = req // Consider typing the loggedinUser if necessary
    try {
        const accountId = req.params.id
        await accountService.remove(accountId)
        // socketService.broadcast({ type: 'account-remove', data: accountId, userId: loggedinUser._id })
        res.send()
    } catch (err) {
        logger.error('Failed to remove account', err)
        res.status(500).send({ err: 'Failed to remove account' })
    }
}

export async function addApptToCalendar(req: Request, res: Response): Promise<void> {
    try {
        const newAppt: Appt = req.body
        const updatedAccount = await accountService.addAppt(newAppt)
        res.json(updatedAccount)
    } catch (err: unknown) {
        logger.error('Failed to add appt', err)
        if (err instanceof Error) {
            if (err.message === apptTaken) res.status(400).json({ error: apptTaken })
            else res.status(500).json({ error: 'Failed to add appt' })
        }
    }
}

export async function removeApptFromCalendar(req: Request, res: Response): Promise<void> {
    try {
        const appt: { accountId: string, apptId: string } = req.body
        const updatedAccount = await accountService.removeAppt(appt)
        res.json(updatedAccount)
    } catch (err) {
        logger.error('Failed to delete appt', err)
        res.status(500).send({ err: 'Failed to delete appt' })
    }
}
