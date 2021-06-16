import logger from "../logger";

export class MessageBuffer {
    private delimiter: string;
    private buffer: string;

    constructor(delimiter: string, debug = false) {
        this.delimiter = delimiter;
        this.buffer = "";

        if (debug) {
            setInterval(
                this.logBuffer.bind(this), 
                1000 * 5
            );
        }
    }

    public logBuffer() {
        logger.log(`Buffer content: ${this.buffer}`);
<<<<<<< HEAD
        logger.log(`Buffer length: ${this.buffer.length}`);
=======
        console.log(`Buffer length: ${this.buffer.length}`);
>>>>>>> 317a9dd34d5fe4cd753ca64f2382f3de40f8769b
    }

    /**
     * @returns true when buffer is empty or don't have an delimiter
     */
    public isDone() {
        return this.buffer.length === 0 || 
            this.buffer.indexOf(this.delimiter) === -1;
    }

    public push(data: string) {
        this.buffer += data;
    }

    public getMessage() {
        const delimiterIndex = this.buffer.indexOf(this.delimiter);

        if (delimiterIndex !== -1) {
            const message = this.buffer.slice(0, delimiterIndex);
            this.buffer = this.buffer.replace(message + this.delimiter, "");
            return message;
        }

        return null
    }

}