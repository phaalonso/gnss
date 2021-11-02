import React, { useState } from "react";
import { useAuth } from "../../hooks/auth";
import { api } from "../../services/api";
import MetricChart from "../MetricChart";
import { Metrics, SubscribeButton } from './styles';

interface GraphicData {
    time: Date,
    value: number,
}

interface IIndices {
	prn: number,
	mediasnr: number,
	mediaazi: number,
	mediaelev: number,
	tinicial: string,
	tfinal: string,
	dpsnr: number,
	s4: number,
}

interface IndicesPorPrn {
	prn: number;
	indices: Omit<IIndices, 'prn'>[];
}

const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

const colors: string[] = [];

for (let i = 0; i < 20; i++) {
	colors.push(randomRGB());
}

const ws = new WebSocket('ws://localhost:3333/websocket');
const MAX_DATA_LENGTH = 100;

const Graphics: React.FC = () => {
	const { data } = useAuth();
    const [ramData, setRamData] = useState<GraphicData[]>([]);
    const [cpuData, setCpuData] = useState<GraphicData[]>([]);
	const [indices, setIndices] = useState<IndicesPorPrn[]>([])

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

	const onIndices = async () => {
		try {
			const res = await api.get('/scintilation');
			console.log(res.data.data);

			setIndices(res.data.data);

		} catch (err) {
			console.error(err);
		}
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
							scales: {
								y: {
									max: 100,
									min: 0
								}
							}
                        }}
                    />
                </div>
            )}

			<SubscribeButton onClick={onIndices} type="submit">Obter dados dos indices</SubscribeButton>
			{indices?.length > 0 && (
				<div>
					<MetricChart 
						data={{
							labels: indices[0].indices.map(ind => new Date(ind.tinicial).toLocaleTimeString('pt-br')),
							datasets: indices
								.map((i, index) => ({
									label: i.prn.toString(),
									data: i.indices.map(ind => ind.s4),
									backgroundColor: colors[index],
									borderColor: colors[index],
									borderWidth: 1
								}))
						}}

						options={{
							interaction: {
								intersect: false
							},
							plugins: {
								legend: {
									//display: false
								},
							},
							scales: {
								x: {
									////time: {
										////tooltipFormat: 'DD T',
									////}
								},
								y: {
									max: 1.5,
									min: 0
								}
							}
						}}
					/>
				</div>
			)}
        </Metrics>
    );
}

export default Graphics;
