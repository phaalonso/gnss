import logger from "../logger";

export class MessageBuffer {
    private readonly delimiter: string;
    private buffer: string;

    constructor(delimiter: string) {
        this.delimiter = delimiter;
        this.buffer = "";
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

        if (delimiterIndex === -1) {
            return null
        }

        const message = this.buffer.slice(0, delimiterIndex);
        this.buffer = this.buffer.slice(delimiterIndex + this.delimiter.length);
        return message;
    }

}