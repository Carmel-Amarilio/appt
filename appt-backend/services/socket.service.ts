import { Server, Socket } from 'socket.io';
import { logger } from './logger.service';

interface EmitToParams {
    type: string;
    data: any;
    label?: string;
}

interface EmitToUserParams {
    type: string;
    data: any;
    userId: string;
}

interface BroadcastParams {
    type: string;
    data: any;
    room?: string | null;
    userId: string;
}

interface CustomSocket extends Socket {
    myTopic?: string;
    userId?: string;
}

let gIo: Server | null = null;

export const socketService = {
    setupSocketAPI,
    emitTo,
    emitToUser,
    broadcast,
};

export function setupSocketAPI(http: any): void {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        },
    });

    gIo.on('connection', (socket: CustomSocket) => {
        logger.info(`New connected socket [id: ${socket.id}]`);

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected [id: ${socket.id}]`);
        });

        socket.on('account-set-topic', (topic: string) => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic);
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`);
            }
            socket.join(topic);
            socket.myTopic = topic;
        });

        socket.on('update-account', (data: any) => {
            broadcast({ type: 'new-account', data: data._id, room: data._id, userId: socket.id });
        });

        socket.on('set-account-socket', (userId: string) => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`);
            socket.userId = userId;
        });

        socket.on('unset-account-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`);
            delete socket.userId;
        });
    });
}

function emitTo({ type, data, label }: EmitToParams): void {
    if (label) gIo?.to('watching:' + label.toString()).emit(type, data);
    else gIo?.emit(type, data);
}

async function emitToUser({ type, data, userId }: EmitToUserParams): Promise<void> {
    userId = userId.toString();
    const socket = await _getUserSocket(userId);

    if (socket) {
        logger.info(`Emitting event: ${type} to user: ${userId} socket [id: ${socket.id}]`);
        socket.emit(type, data);
    } else {
        logger.info(`No active socket for user: ${userId}`);
    }
}

async function broadcast({ type, data, room = null, userId }: BroadcastParams): Promise<void> {
    userId = userId.toString();
    const excludedSocket = await _getUserSocket(userId);
    if (room && excludedSocket) {
        excludedSocket.broadcast.to(room).emit(type, data);
    } else if (excludedSocket) {
        excludedSocket.broadcast.emit(type, data);
    } else if (room) {
        gIo?.to(room).emit(type, data);
    } else {
        gIo?.emit(type, data);
    }
}

async function _getUserSocket(userId: string): Promise<CustomSocket | undefined> {
    const sockets = await _getAllSockets();
    return sockets.find(s => s.userId === userId);
}

async function _getAllSockets(): Promise<CustomSocket[]> {
    return await gIo?.fetchSockets() ?? [];
}

async function _printSockets(): Promise<void> {
    const sockets = await _getAllSockets();
    console.log(`Sockets: (count: ${sockets.length}):`);
    sockets.forEach(_printSocket);
}

function _printSocket(socket: CustomSocket): void {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
}
