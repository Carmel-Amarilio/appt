import { MongoClient } from 'mongodb';
import { config } from '../config/index';
import { logger } from './logger.service';

export const dbService = {
    getCollection
};

let dbConn: any | null = null;

async function getCollection(collectionName: string): Promise<any> {
    try {
        const db = await _connect();
        const collection = db.collection(collectionName);
        return collection;
    } catch (err) {
        logger.error('Failed to get Mongo collection', err);
        throw err;
    }
}

async function _connect(): Promise<any> {
    if (dbConn) return dbConn;

    try {
        // @ts-ignore
        const client = await MongoClient.connect(config.dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        // @ts-ignore
        const db = client.db(config.dbName);
        dbConn = db;
        return db;
    } catch (err) {
        logger.error('Cannot Connect to DB', err);
        throw err;
    }
}
