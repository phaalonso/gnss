import { inspect } from 'util';
import { Error } from "mongoose";
const stdout = process.stdout;

const log = (...args: any[]) => {
    const time = new Date().toLocaleString('pt-br');

    // for (const a of args)
    //     console.log(a.stack ? a.stack || a.name || a.message : a);
    stdout.write(`[\x1b[32m${time}\x1b[0m] ${args.length > 1 ? args.map(a => a.toString()).join(' ') : args.toString()}\n`);
}

const exception = (err: Error | string, prefix?: string) => {
    let message = '';
    let stack = '';

    if (err instanceof Error) {
        message = err.message;
        stack = err.stack;
    } else {
        message = typeof err === 'string' ? err : inspect(err);
        stack = new Error(message).stack;
    }

    log(`\x1b[34m${prefix ? prefix : ''}\x1b[0m ${message}, stack ${stack}`);
}

/**
 * @description small custom logger
 */
const logger = {
    log,
    exception,
}
//
// logger.log('a')
// logger.log('eae', new Date());
// logger.log(new Error('a'));
//
// try {
//     throw DOMError;
// } catch (e) {
//     logger.exception(e, 'erro top');
// }
//
export default logger;