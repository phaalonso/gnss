import React, { useState, useEffect } from 'react';
import './App.css';

import { Line } from 'react-chartjs-2';

const ws = new WebSocket('ws://localhost:4312');

interface GraphicData {
  time: Date,
  value: number,
}

const App: React.FC = () => {
  const [ramData, setRamData] = useState<GraphicData[]>([]);
  const [cpuData, setCpuData] = useState<number[]>([]);

  useEffect(() => {
    console.log(ramData);
  }, [ramData]);

  ws.onopen = () => {
    console.log('Conexão aberta')
  }

  ws.onmessage = ev => {
    const msg = ev.data;

    const ramMatch = msg.match(/^ram_(.*)$/);

    if (ramMatch) {
      const data: GraphicData = {
        time: new Date(),
        value: parseFloat(ramMatch[1]),
      }

      setRamData([
          ...ramData,
          data,
      ])
    }

    const cpuMatch = msg.match(/^cpu_(.*)$/);

    if (cpuMatch) {
      setCpuData([
          ...cpuData,
          parseFloat(cpuMatch[1]),
      ]);
    }
  }

  ws.onerror = err => {
    console.error(err);
  }

  const onClickRam = () => {
    console.log('Read state', ws.readyState);

    ws.send('sub_ram');
  }

  const onClickCpu = () => {
    ws.send('sub_cpu');
  }

  return (
    <div className="App">
        Websocket

        <div>
          <button onClick={onClickRam} type="submit">Ram</button>
          <button onClick={onClickCpu} type="submit">CPU</button>
        </div>

      { ramData.length > 0 ? (
          <div>
            <div>
              <span>Ram: </span>
              <span>{ramData[ramData.length -1].value}</span>
            </div>

            <Line
                type='line'
                title="Uso de RAM"
                style={{ width: 700, height: 700 }}
                data={{
                  labels: ramData.map(r => r.time.toLocaleTimeString('pt-br')),
                  datasets: [{
                    title: 'Ram',
                    data: ramData.map(r => r.value),
                    backgroundColor: 'rgb(75, 192, 192)',
                    borderWidth: 5,
                    lineTension: 0.1,
                  }]
                }}
                options={{
                  animation: false,
                  scales: {
                    xAxes: [
                      {
                        type: 'time',
                        time: {
                          unit: 'minutes',
                        }
                      },
                    ],
                      // y: {
                      //   beginAtZero: true,
                      // }
                  }
                }}

            />
          </div>
      ) : <div> Dado não encontrado </div> }

      { cpuData.length > 0 ? (
          <div>
            <div>
              <span>Cpu: </span>
              <span>{cpuData[cpuData.length -1]}</span>
            </div>

            <Line
                type='line'
                data={{
                  labels: ['Cpu', 'Tempo'],
                  dataset: {
                    data: cpuData,
                    backgroundColor: '#5555',
                  }
                }}
            />
          </div>
      ) : <div> Dado não encontrado </div> }
    </div>
  );
}

export default App;
