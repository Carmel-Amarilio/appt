import fs from 'fs';

const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

export const logger = {
    debug(...args: unknown[]) {
        if (process.env.NODE_ENV === 'production') return;
        _doLog('DEBUG', ...args);
    },
    info(...args: unknown[]) {
        _doLog('INFO', ...args);
    },
    warn(...args: unknown[]) {
        _doLog('WARN', ...args);
    },
    error(...args: unknown[]) {
        _doLog('ERROR', ...args);
    }
};

function _getTime(): string {
    let now = new Date();
    return now.toLocaleString('he'); // define the time format
}

function _isError(e: any): e is Error {
    return e && e.stack && e.message;
}

function _doLog(level: string, ...args: unknown[]): void {
    const strs = args.map(arg =>
        (typeof arg === 'string' || _isError(arg)) ? arg : JSON.stringify(arg)
    );

    let line = strs.join(' | ');
    line = `${_getTime()} - ${level} - ${line} \n`;
    console.log(line);
    fs.appendFile('./logs/backend.log', line, (err) => {
        if (err) console.log('FATAL: cannot write to log file');
    });
}
