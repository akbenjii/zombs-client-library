'use strict';

const keepLogs = {
    "debug": "1d",
    "info": "1d",
    "warn": "2d",
    "error": "3d",
    "incoming": "1d",
    "outgoing": "1d"
};

const {createLogger, transports, format, addColors} = require('winston');
const {combine, colorize, timestamp, json, printf} = format;

require('winston-daily-rotate-file');
addColors({incoming: 'bold white blueBG', outgoing: 'bold white redBG'});

const textFormat = printf(({level, message, timestamp}) => {
    return `[\x1b[36m${timestamp}\x1b[0m] [${level}] \x1b[35m>\x1b[0m ${message}`;
});

const loggers = {};

const logLevels = {
    debug: 7,
    info: 6,
    warn: 4,
    error: 3,
    incoming: 6,
    outgoing: 6
};

exports.init = (levelsToLog) => {
    Object.entries(logLevels).forEach(([level, value]) => {
        loggers[level] = createLogger({
            levels: {[level]: value},
            transports: [
                new transports.DailyRotateFile({
                    level: level,
                    maxFiles: keepLogs[level],
                    filename: `./logs/${level}@%DATE%.log`,
                    datePattern: 'D-M-YYYY',
                    format: combine(timestamp({format: 'HH:mm:ss'}), json())
                }),
                new transports.Console({
                    level: level,
                    format: combine(colorize(), timestamp({format: 'HH:mm:ss'}), textFormat),
                    silent: !levelsToLog.includes(level)
                })
            ]
        });

        exports[level] = (msg) => loggers[level][level](msg);
    });
}