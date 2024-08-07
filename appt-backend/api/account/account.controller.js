import { logger } from "../../services/logger.service.js"
import { socketService } from "../../services/socket.service.js"
import { authService } from "../auth/auth.service.js"
import { accountService } from "./account.service.js"

export async function getAccounts(req, res) {

    try {
        const filterBy = {
            bizName: req.query.bizName || '',
        }
        logger.debug('Getting A', filterBy)
        const accounts = await accountService.query(filterBy)
        res.json(accounts)
    } catch (err) {
        logger.error('Failed to get accounts', err)
        res.status(500).send({ err: 'Failed to get accounts' })
    }
}

export async function getAccountById(req, res) {
    try {
        const accountId = req.params.id
        const account = await accountService.getById(accountId)
        res.json(account)
    } catch (err) {
        logger.error('Failed to get account', err)
        res.status(500).send({ err: 'Failed to get account' })
    }
}

export async function addAccount(req, res) {
    try {
        const account = req.body
        const { phone, password } = account
        const addedAccount = await accountService.add(account)

        const user = await authService.login(phone, password)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)

        res.json(addedAccount)
    } catch (err) {
        logger.error('Failed to add account', err)
        res.status(500).send({ err: 'Failed to add account' })
    }
}

export async function updateAccount(req, res) {
    try {
        const account = req.body
        const updatedAccount = await accountService.update(account)
        res.json(updatedAccount)
    } catch (err) {
        logger.error('Failed to update account', err)
        res.status(500).send({ err: 'Failed to update account' })
    }
}

export async function removeAccount(req, res) {
    console.log('hi from remove account');
    const { loggedinUser } = req
    try {
        const accountId = req.params.id
        await accountService.remove(accountId)
        // socketService.broadcast({ type: 'toy-remove', data: toyId, userId: loggedinUser._id })
        res.send()
    } catch (err) {
        logger.error('Failed to remove account', err)
        res.status(500).send({ err: 'Failed to remove account' })
    }
}

export async function addApptToCalendar(req, res) {
    try {
        const newAppt = req.body
        const updatedAccount = await accountService.addAppt(newAppt)
        res.json(updatedAccount)
    } catch (err) {
        logger.error('Failed to add appt', err)
        res.status(500).send({ err: 'Failed to add appt' })
    }
}

export async function removeApptFromCalendar(req, res) {
    try {
        const appt = req.body
        // console.log(appt);
        const updatedAccount = await accountService.removeAppt(appt)
        res.json(updatedAccount)

    } catch (err) {
        logger.error('Failed to delete appt', err)
        res.status(500).send({ err: 'Failed to delete appt' })
    }
}

