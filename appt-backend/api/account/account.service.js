import bcrypt from 'bcrypt'
import mongodb from 'mongodb';
const { ObjectId } = mongodb;

import { dbService } from '../../services/db.service.js';
import { logger } from '../../services/logger.service.js';
import { utilService } from '../../services/util.service.js';

export const accountService = {
    remove,
    query,
    getById,
    add,
    update,
    getByPhone,
    addAppt,
    removeAppt
};

async function query({ bizName }) {
    try {
        const criteria = {};
        criteria['name'] = { $regex: bizName, $options: 'i' }

        const collection = await dbService.getCollection('account');
        const accounts = await collection.find(criteria).toArray();
        accounts.map(account => delete account.password);
        return accounts
    } catch (err) {
        logger.error('Cannot find accounts', err);
        throw err;
    }
}

async function getById(accountId) {
    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ _id: ObjectId(accountId) });
        delete account.password
        return account;
    } catch (err) {
        logger.error(`while finding account ${accountId}`, err);
        throw err;
    }
}

async function remove(accountId) {
    try {
        const collection = await dbService.getCollection('account');
        await collection.deleteOne({ _id: ObjectId(accountId) });
    } catch (err) {
        logger.error(`cannot remove account ${accountId}`, err);
        throw err;
    }
}

async function add(account) {
    const { password } = account
    const saltRounds = 10
    try {
        const collection = await dbService.getCollection('account');
        const hash = await bcrypt.hash(password, saltRounds)
        const accountToSave = { ...account, password: hash }
        await collection.insertOne(accountToSave);
        return accountToSave;
    } catch (err) {
        console.log(err);
        logger.error('cannot insert account', err);
        throw err;
    }
}

async function update(account) {
    const { _id, ...rest } = account;
    try {
        const collection = await dbService.getCollection('account');
        await collection.updateOne({ _id: ObjectId(_id) }, { $set: rest })
        return account
    } catch (err) {
        logger.error(`cannot update account ${_id}`, err);
        throw err;
    }
}


async function getByPhone(phone) {
    try {
        const collection = await dbService.getCollection('account')
        const account = await collection.findOne({ phone })
        return account
    } catch (err) {
        logger.error(`while finding account ${phone}`, err)
        throw err
    }
}



async function addAppt(newAppt) {
    const { accountId, calendarId, date, appt } = newAppt
    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ _id: ObjectId(accountId) });
        const calendar = account.calendars.find(({ _id }) => _id === calendarId)
        let scheduledDate = calendar.scheduledDates.find(({ _id }) => new Date(_id).getTime() === new Date(date).getTime())
        if (scheduledDate) scheduledDate.daysSchedule.push(appt)
        else {
            const { startTime, finishesTime, apptLong, breakTime, hoursOff } = calendar
            scheduledDate = { _id: date, dayStartTime: startTime, dayFinishesTime: finishesTime, dayApptLong: apptLong, dayBreakTime: breakTime, dayHoursOff: hoursOff, daysSchedule: [appt] }
            calendar.scheduledDates.push(scheduledDate)
        }

        return update(account)

    } catch (err) {
        logger.error(`cannot insert appt`, err)
        throw err
    }
}

async function removeAppt(appt) {
    const { accountId, calendarId, date, apptId } = appt
    console.log(appt);
    try {
        const collection = await dbService.getCollection('account');
        const account = await collection.findOne({ _id: ObjectId(accountId) });
        const calendar = account.calendars.find(({ _id }) => _id === calendarId)
        const scheduledDate = calendar.scheduledDates.find(({ _id }) => new Date(_id).getTime() === new Date(date).getTime())
        const newsDaysSchedule = scheduledDate.daysSchedule.filter(({ _id }) => _id != apptId)
        scheduledDate.daysSchedule = newsDaysSchedule

        return update(account)

    } catch (err) {
        logger.error(`cannot remove appt`, err)
        throw err
    }
}