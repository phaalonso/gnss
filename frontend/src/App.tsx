import React, { useState } from 'react';
import './App.css';

import MetricChart from "./components/MetricChart";

const ws = new WebSocket('ws://localhost:4312');

interface GraphicData {
  time: Date,
  value: number,
}

const MAX_DATA_LENGTH = 10;

const App: React.FC = () => {
  const [ramData, setRamData] = useState<GraphicData[]>([]);
  const [cpuData, setCpuData] = useState<GraphicData[]>([]);

  ws.onopen = () => {
    console.log('Conexão aberta')
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
      ) : <div> Dado não encontrado </div> }

      { cpuData.length > 0 ? (
          <div>
            <div>
              <span>Cpu: </span>
              <span>{cpuData[cpuData.length -1].value}</span>
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
      ) : <div> Dado não encontrado </div> }
    </div>
  );
}

export default App;
