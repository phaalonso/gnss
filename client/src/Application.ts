import { MessageHandler } from "./clients/MessageHandler";
import { SocketClient } from "./clients/SocketClient";
import config from "./config/ConfigProvider";
import { IPrnIndicesController, IPrnInfoController } from "./controller";
import { ProcessData } from "./ProcessData";

export class Application {
    private client: SocketClient;
    private processData: ProcessData;

    constructor(
        prnInfoController: IPrnInfoController,
        prnIndicesController: IPrnIndicesController
    ) {
		const clientConfig = config.get('client');

        this.processData = new ProcessData(prnInfoController, prnIndicesController);

        const messageHandler = new MessageHandler(this.processData, '\n');

		this.client = new SocketClient({ 
			port: clientConfig.port, 
			host: clientConfig.host 
		});

        this.client.onMessage(messageHandler.handle.bind(messageHandler));
    }

    async run() {
        return this.client.start();
    }
}
