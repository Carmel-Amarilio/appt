import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { validateAccount, validateAppt } from '../../middlewares/validator.middleware.js'
import { getAccounts, getAccountById, addAccount, updateAccount, removeAccount, addApptToCalendar, removeApptFromCalendar, } from './account.controller.js'

export const accountRoutes = express.Router()

accountRoutes.get('/', getAccounts)
accountRoutes.get('/:id', getAccountById)
accountRoutes.post('/', validateAccount, addAccount)
accountRoutes.put('/', validateAccount, requireAuth, updateAccount)

accountRoutes.post('/appt', validateAppt, addApptToCalendar)
accountRoutes.delete('/appt', removeApptFromCalendar)

accountRoutes.delete('/:id', requireAuth, removeAccount)
