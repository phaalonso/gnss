import fs, { ReadStream, WriteStream } from 'node:fs';
import GPS from 'gps';
import logger from "./logger";
import { ReadlineParser, SerialPort } from "serialport";

interface DataProviderConfig {
    serialInput?: string;
    fileInput?: string;
    baudRate?: number;
}

export class GPSProvider extends GPS {
    private readonly config: DataProviderConfig;
    protected inputStream!: SerialPort | ReadStream;
    protected parserStream!: ReadlineParser;
    protected writeStream?: WriteStream;

    constructor(config: DataProviderConfig) {
        super();
        if (!config.serialInput && !config.fileInput) {
            throw new Error('You must provide a serial input or a file input');
        }

        if (config.serialInput && config.fileInput) {
            throw new Error('You can only provide a serial input or a file input, not both');
        }

        this.config = config;

        this.parserStream = new ReadlineParser({
            delimiter: '\r\n',
        });

        this.parserStream.on('error', err => {
            logger.exception(err, 'Parser');
        });
    }

    private inputSetup() {
        if (this.config.serialInput) {
            logger.log(`Receiving data from serial input: ${this.config.serialInput}`);

            this.inputStream = new SerialPort({
                path: this.config.serialInput,
                baudRate: this.config.baudRate || 115200,
            }, error => {
                console.error(error);
                process.exit(1)
            });

            this.inputStream.on('error', (err: Error) => {
                logger.exception(err);
            });
        } else if (this.config.fileInput) {
            logger.log(`Receiving data from file input ${this.config.fileInput}`);

            this.inputStream = fs.createReadStream(this.config.fileInput);

            this.inputStream.on('error', (err: Error) => {
                logger.exception(err, `Exception while reading input stream from file ${this.config.fileInput}`)
            });

            this.inputStream.on('end', () => {
                logger.log('End of the file');
            });
        }
    }

    /**
     * @description método responsável por inicializar as streams utilizadas para
     * o recebimento de dados no formato NMEA
     */
    public parse(): void {
        logger.log(`Piping data to GPS`);

        this.inputSetup();

        this.inputStream.pipe(this.parserStream);

        this.parserStream.on('data', (data) => {
			try {
				this.update(data);
			} catch (error) {
				logger.exception(error instanceof Error ? error : String(error), 'Parser');
			}
        });

        this.on('error', (err: Error) => logger.exception(err));
    }

    public writeToFile(file: string): void {
        logger.log(`Piping data to file ${file}`);
        const writeStream = fs.createWriteStream(file);

        this.inputStream.pipe(writeStream);
    }

    public close(): void {
        this.inputStream?.close();
        this.writeStream?.close();
    }
}
