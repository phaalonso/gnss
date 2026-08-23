import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from '../config/gpsConfig';
import fs, { ReadStream, WriteStream } from 'node:fs';
import GPS from 'gps';
import logger from "../logger";
import { EventEmitter } from "node:events";

interface DataProviderConfig {
    serialInput?: string;
    fileInput?: string;
}

/**
 * @description GnssDataStream is a class to help extend GPS node package, receiving
 * the NMEA data directly from the serial port
 */
export class DataProvider {
    private readonly gps = new GPS()
    private readonly eventEmitter = new EventEmitter();
    protected inputStream: SerialPort | ReadStream;
    protected parserStream: parsers.Readline;
    protected writeStream?: WriteStream;

    constructor(config: DataProviderConfig) {
        if (!config.serialInput && !config.fileInput) {
            throw new Error('You must provide a serial input or a file input');
        }

        if (config.serialInput && config.fileInput) {
            throw new Error('You can only provide a serial input or a file input, not both');
        }

        this.gps.on('data', (data) => {
            this.eventEmitter.emit('data', data)
        })

        if (config.serialInput) {
            this.setSerialInput(config.serialInput);
        } else if (config.fileInput) {
            this.setFileInput(config.fileInput);
        }
    }

    private setSerialInput(input: string) {
        this.inputStream = new SerialPort(input, {
            baudRate: GPSConfig.baudRate,
        });

        this.inputStream.on('error', (err: Error) => {
            if (err.message.includes('No such file or directory')) {
                logger.log(`Cant find input file ${input}`);
                process.exit(1);
            }

            logger.exception(err, 'Serial port')
        });
    }

    private setFileInput(fileInput: string) {
        logger.log(`Receiving data from file input ${fileInput}`);

        this.inputStream = fs.createReadStream(fileInput);

        this.inputStream.on('error', err => {
            logger.exception(err, 'Serial port')
        });

        this.inputStream.on('end', () => {
            process.exit(0);
        });
    }

    public pipeToGps(): void {
        logger.log(`Piping data to GPS`);

        this.parserStream = new parsers.Readline({
            delimiter: '\r\n',
        });

        this.parserStream.on('error', err => {
            logger.exception(err, 'Parser');
        });

        this.inputStream.pipe(this.parserStream);

        this.parserStream.on('data', data => {
            try {
                this.gps.update(data);
            } catch (err) {
                logger.exception(err.message);
            }
        });

        this.parserStream.on('error', err => {
            logger.exception(err, 'Parser');
        })
    }

    public pipeToFile(file: string): void {
        logger.log(`Piping data to file ${file}`);
        const writeStream = fs.createWriteStream(file);

        this.inputStream.pipe(writeStream);
    }

    public close(): void {
        this.writeStream?.close();
        this.inputStream?.close();
    }
}
