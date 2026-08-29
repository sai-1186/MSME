const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { analyzeMachineHealth } = require('./ai/ruleEngine');
const { generateSimulatedData } = require('./sensors/simulator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const PORT = 8080;

let isSimulationEnabled = false;
let simulationInterval = null;

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Broadcast to all connected WS clients
function broadcastData(data, source) {
  const processedData = {
    ...data,
    source,
    ...analyzeMachineHealth(data)
  };
  
  const payload = JSON.stringify(processedData);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
  
  return processedData;
}

// Endpoint for ESP32 to push real sensor data
app.post('/api/data', (req, res) => {
  if (isSimulationEnabled) {
    return res.status(400).json({ error: 'Simulation mode is active' });
  }
  
  try {
    const data = req.body;
    // Basic validation
    const requiredFields = [
      'temperature', 'humidity', 'vibrationX', 'vibrationY', 'vibrationZ', 'current'
    ];
    if (!data.machineId || requiredFields.some((field) => !Number.isFinite(data[field]))) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log('Sensor data received:', data);
    const processed = broadcastData(data, 'SENSOR');
    res.status(200).json({ success: true, healthScore: processed.healthScore });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simulation Control Endpoints
app.post('/api/simulation/start', (req, res) => {
  if (isSimulationEnabled) {
    return res.json({ status: 'already running' });
  }
  
  isSimulationEnabled = true;
  console.log('Simulation started');
  
  simulationInterval = setInterval(() => {
    const simData = generateSimulatedData();
    broadcastData(simData, 'SIMULATION');
  }, 2000); // Send data every 2 seconds
  
  res.json({ status: 'started' });
});

app.post('/api/simulation/stop', (req, res) => {
  if (!isSimulationEnabled) {
    return res.json({ status: 'already stopped' });
  }
  
  isSimulationEnabled = false;
  clearInterval(simulationInterval);
  console.log('Simulation stopped');
  
  res.json({ status: 'stopped' });
});

app.get('/api/simulation/status', (req, res) => {
  res.json({ enabled: isSimulationEnabled });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TX Server running on http://0.0.0.0:${PORT}`);
  console.log(`WebSocket server listening on ws://0.0.0.0:${PORT}`);
});
