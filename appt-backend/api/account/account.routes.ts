import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware'
import { validateAccount, validateAppt } from '../../middlewares/validator.middleware'
import { getAccounts, getAccountById, addAccount, updateAccount, removeAccount, addApptToCalendar, removeApptFromCalendar, updateApptInCalendar, } from './account.controller'

export const accountRoutes = express.Router()

accountRoutes.get('/', getAccounts)
accountRoutes.get('/:id', getAccountById)
accountRoutes.post('/', validateAccount, addAccount)
accountRoutes.put('/', validateAccount, requireAuth, updateAccount)

accountRoutes.post('/appt', validateAppt, addApptToCalendar)
accountRoutes.put('/appt', validateAppt, updateApptInCalendar)
accountRoutes.delete('/appt', removeApptFromCalendar)

accountRoutes.delete('/:id', requireAuth, removeAccount)
