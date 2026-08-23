import logger from "../logger";

export class MessageBuffer {
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
    }

    public getMessage() {
        const delimiterIndex = this.buffer.indexOf(this.delimiter);

        if (delimiterIndex !== -1) {
            let message = this.buffer.slice(0, delimiterIndex);
            this.buffer = this.buffer.replace(message + this.delimiter, "");
            return message;
        }

        return null
    }

}