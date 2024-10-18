import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

import { dbService } from '../../services/db.service';
import { logger } from '../../services/logger.service';
import { utilService } from '../../services/util.service';
import { apptTaken } from '../../services/errorMessege';
import { Account, Appt, Event, FilterBy } from '../../models/models';

export const accountService = {
    remove,
    query,
    getById,
    add,
    update,
    getByPhone,
    addAppt,
    updateAppt,
    removeAppt
};

const gLockedAppt: Record<string, boolean> = {};


async function query({ bizName, page }: FilterBy): Promise<Account[]> {
    const pageQuantity = 5;
    const skip = page * pageQuantity;
    try {
        const criteria = { name: { $regex: bizName, $options: 'i' } };

        const collection = await dbService.getCollection('account');
        const accounts: Account[] = await collection.find(criteria).skip(skip).limit(pageQuantity).toArray();
        accounts.forEach((account) => delete account.password)
        return accounts;
    } catch (err) {
        logger.error('Cannot find accounts', err);
        throw err;
    }
}

async function getById(accountId: string): Promise<Account | null> {
    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ _id: new ObjectId(accountId) });
        if (account) delete account.password;
        // @ts-ignore
        return account;
    } catch (err) {
        logger.error(`while finding account ${accountId}`, err);
        throw err;
    }
}

async function remove(accountId: string): Promise<void> {
    try {
        const collection = await dbService.getCollection('account');
        await collection.deleteOne({ _id: new ObjectId(accountId) });
    } catch (err) {
        logger.error(`cannot remove account ${accountId}`, err);
        throw err;
    }
}

async function add(account: Account): Promise<Account> {
    const { password } = account
    const saltRounds = 10;
    if (!password) throw new Error('Password is required')
    try {
        const collection = await dbService.getCollection('account')
        const hash = await bcrypt.hash(password, saltRounds)
        const accountToSave: Account = { ...account, password: hash }
        // @ts-ignore
        await collection.insertOne(accountToSave)
        return accountToSave
    } catch (err) {
        logger.error('cannot insert account', err)
        throw err
    }
}

async function update(account: Account): Promise<Account> {
    const { _id, ...rest } = account;
    try {
        const collection = await dbService.getCollection('account');
        await collection.updateOne({ _id: new ObjectId(_id) }, { $set: rest });
        // @ts-ignore
        return account;
    } catch (err) {
        logger.error(`cannot update account ${_id}`, err);
        throw err;
    }
}

async function getByPhone(phone: string): Promise<Account | null> {
    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ phone });
        // @ts-ignore
        return account;
    } catch (err) {
        logger.error(`while finding account ${phone}`, err);
        throw err;
    }
}

async function addAppt(newAppt: Appt): Promise<Account> {
    const { accountId, appt } = newAppt;


    const strTimeKey = `${accountId}${appt.start}${appt.end}`;
    if (gLockedAppt[strTimeKey]) throw new Error(apptTaken);
    gLockedAppt[strTimeKey] = true;

    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ _id: new ObjectId(accountId) });
        if (!account) throw new Error('Account not found');

        if (!utilService.isApptAvailable(account.calendar, appt)) {
            throw new Error(apptTaken);
        }

        await collection.updateOne({ _id: new ObjectId(accountId) }, { $push: { 'calendar.events': appt } });
        account.calendar.events.push(appt);
        delete gLockedAppt[strTimeKey];
        // @ts-ignore
        return account;
    } catch (err) {
        logger.error('cannot insert appt', err);
        delete gLockedAppt[strTimeKey];
        throw err;
    }
}

async function updateAppt(newAppt: { appt: Event, accountId: string }): Promise<Account> {
    const { accountId, appt } = newAppt;

    try {
        const collection = await dbService.getCollection('account')
        const account: Account = await collection.findOne({ _id: new ObjectId(accountId) })
        if (!account) throw new Error('Account not found')
        // @ts-ignore
        if (appt.maxParticipants < appt.maxParticipants) {
            throw new Error(apptTaken);
        }

        account.calendar.events = account.calendar.events.map(event => event._id === appt._id ? appt : event)
        return update(account)
    } catch (err) {
        logger.error('cannot insert appt', err);
        throw err;
    }
}

async function removeAppt(appt: { accountId: string, apptId: string }): Promise<Account> {
    const { accountId, apptId } = appt;
    try {
        const collection = await dbService.getCollection('account');
        // @ts-ignore
        const account: Account = await collection.findOne({ _id: new ObjectId(accountId) });
        if (!account) throw new Error('Account not found');

        await collection.updateOne({ _id: new ObjectId(accountId) }, { $pull: { 'calendar.events': { _id: apptId } } });
        account.calendar.events = account.calendar.events.filter(({ _id }) => _id !== apptId);
        return account;
    } catch (err) {
        logger.error('cannot remove appt', err);
        throw err;
    }
}
