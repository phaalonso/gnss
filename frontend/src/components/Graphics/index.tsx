import React, { useState } from "react";
import { useAuth } from "../../hooks/auth";
import MetricChart from "../MetricChart";
import { Metrics, SubscribeButton } from './styles';

interface GraphicData {
    time: Date,
    value: number,
}

const ws = new WebSocket('ws://localhost:3333');
const MAX_DATA_LENGTH = 100;

const Graphics: React.FC = () => {
	const { data } = useAuth();
    const [ramData, setRamData] = useState<GraphicData[]>([]);
    const [cpuData, setCpuData] = useState<GraphicData[]>([]);

    ws.onopen = () => {
        console.log('Conexão aberta');
		ws.send(`token_${data.token}`);
    }
	
	ws.onclose = () => {
		console.log('Conexão fechada');
	}

    ws.onmessage = ev => {
        const msg = ev.data;

        const ramMatch = msg.match(/^ram_(.*)$/);

        if (ramMatch) {
            let array = ramData;

            const data: GraphicData = {
                time: new Date(),
                value: parseFloat(ramMatch[1]),
            }

            if (ramData.length > MAX_DATA_LENGTH) {
                const diff = ramData.length - MAX_DATA_LENGTH;

                array = ramData.slice(diff, ramData.length);
            }

            setRamData([
                ...array,
                data,
            ])
        }

        const cpuMatch = msg.match(/^cpu_(.*)$/);

        if (cpuMatch) {
            let array = cpuData;

            const data: GraphicData = {
                time: new Date(),
                value: parseFloat(cpuMatch[1]),
            }

            if (cpuData.length > MAX_DATA_LENGTH) {
                const diff = cpuData.length - MAX_DATA_LENGTH;

                array = cpuData.slice(diff, cpuData.length);
            }

            setCpuData([
                ...array,
                data,
            ]);
        }
    }

    ws.onerror = err => {
        console.error(err);
    }

    const onClickRam = () => {
		if (ws.readyState === ws.CONNECTING) {
			alert('Webscoket ainda está no estado CONNECTING');
			return;
		}
        console.log('Read state', ws.readyState);

        ws.send('sub_ram');
    }

    const onClickCpu = () => {
		if (ws.readyState === ws.CONNECTING) {
			alert('Webscoket ainda está no estado CONNECTING');
			return;
		}

        ws.send('sub_cpu');
    }

    return (
        <Metrics>
            <SubscribeButton onClick={onClickRam} type="submit">Obter dados de RAM</SubscribeButton>
            {ramData.length > 0 && (
                <div>
                    <div>
                        <span>Ram: </span>
                        <span>{ramData[ramData.length - 1].value} Mb</span>
                    </div>

                    <MetricChart
                        data={{
							labels: ramData.map(r => r.time.toLocaleTimeString('pt-br')),
                            datasets: [{
                                data: ramData.map(r => r.value),
                                backgroundColor: 'rgb(75, 192, 192)',
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 1,
                            }]
                        }}
                    />
                </div>
            )}

            <SubscribeButton onClick={onClickCpu} type="submit">Obter dados de CPU</SubscribeButton>
            {cpuData.length > 0 && (
                <div>
                    <div>
                        <span>Cpu: </span>
                        <span>{cpuData[cpuData.length - 1].value} %</span>
                    </div>

                    <MetricChart
                        data={{
                            labels: cpuData.map(c => c.time.toLocaleTimeString('pt-br')),
                            datasets: [{
                                data: cpuData.map(c => c.value),
                                backgroundColor: 'rgb(75, 192, 192)',
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 1,
                            }]
                        }}
                        options={{
                            animation: false,
                        }}
                    />
                </div>
            )}
        </Metrics>
    );
}

export default Graphics;
