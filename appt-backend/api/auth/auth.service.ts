import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { logger } from '../../services/logger.service'
import { accountService } from '../account/account.service'
import { InvalidLogin } from '../../services/errorMessege'
import { Account } from '../../models/models'

export const authService = {
    login,
    getLoginToken,
    validateToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(phone: string, password: string) {
    logger.debug(`auth.service - login with accountName: ${phone}`)

    const account = await accountService.getByPhone(phone)
    if (!account) throw new Error(InvalidLogin)
    if (!account.password) throw new Error('Password is required')
    const match = await bcrypt.compare(password, account.password)
    if (!match) throw new Error(InvalidLogin)

    delete account.password
    return account
}



function getLoginToken(account: Account) {
    const { _id, name, phone } = account
    const userInfo = { _id, name, phone }
    return cryptr.encrypt(JSON.stringify(userInfo))
}




function validateToken(loginToken: string) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}