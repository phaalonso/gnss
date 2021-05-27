import React, { useState, useEffect } from 'react';
import './App.css';

import { Line } from 'react-chartjs-2';

const ws = new WebSocket('ws://localhost:4312');

const App: React.FC = () => {
  const [ramData, setRamData] = useState<number[]>([]);
  const [cpuData, setCpuData] = useState<number[]>([]);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    console.log(ramData);
    setChartData({
      labels: 'Ram',
      dataset: ramData,
      redraw: true,
    });
  }, [ramData]);

  ws.onopen = () => {
    console.log('Conexão aberta')
  }

  ws.onmessage = ev => {
    const msg = ev.data;

    const ramMatch = msg.match(/^ram_(.*)$/);

    if (ramMatch) {
      setRamData([
          ...ramData,
          ramMatch[1],
      ])
    }

    const cpuMatch = msg.match(/^cpu_(.*)$/);

    if (cpuMatch) {
      setCpuData([
          ...cpuData,
          cpuMatch[1],
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

        <Line type={'line'} data={{      labels: ['Ram', 'Tempo'],
          dataset: {
            data: ramData,
            backgroundColor: '#5555',
          }}}/>
    </div>
  );
}

export default App;
