import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { logger } from '../../services/logger.service.js'
import { accountService } from '../account/account.service.js'

export const authService = {
    login,
    getLoginToken,
    validateToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(phone, password) {
    logger.debug(`auth.service - login with accountName: ${phone}`)

    const account = await accountService.getByPhone(phone)
    if (!account) throw new Error('Invalid accountName or password')

    const match = await bcrypt.compare(password, account.password)
    if (!match) throw new Error('Invalid accountName or password')

    delete account.password
    return account
}



function getLoginToken(user) {
    const { _id, fullName, isAdmin, userName } = user
    const userInfo = { _id, fullName, isAdmin, userName }
    return cryptr.encrypt(JSON.stringify(userInfo))
}




function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}