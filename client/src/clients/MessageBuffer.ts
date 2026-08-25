import logger from "../logger";

export class MessageBuffer {
    /** Safety cap: if no delimiter arrives for this many bytes, drop the oldest data to bound memory. */
    private static readonly MAX_BUFFER_LENGTH = 1024 * 1024;

    private readonly delimiter: string;
    private buffer: string;

    constructor(delimiter: string) {
        this.delimiter = delimiter;
        this.buffer = "";
    }

    public logBuffer() {
        logger.log(`Buffer content: ${this.buffer}`);
        logger.log(`Buffer length: ${this.buffer.length}`);
    }

    /**
     * @returns true when buffer is empty or don't have an delimiter
     */
    public isDone() {
        return this.buffer.length === 0 ||
            !this.buffer.includes(this.delimiter);
    }

    public push(data: string) {
        this.buffer += data;

        if (this.buffer.length > MessageBuffer.MAX_BUFFER_LENGTH) {
            const overflow = this.buffer.length - MessageBuffer.MAX_BUFFER_LENGTH;
            logger.log(`MessageBuffer overflow: dropping oldest ${overflow} bytes`);
            this.buffer = this.buffer.slice(overflow);
        }
    }

    public getMessage() {
        const delimiterIndex = this.buffer.indexOf(this.delimiter);

        if (delimiterIndex === -1) {
            return null;
        }

        const message = this.buffer.slice(0, delimiterIndex);
        this.buffer = this.buffer.slice(delimiterIndex + this.delimiter.length);

        return message;
    }

}
