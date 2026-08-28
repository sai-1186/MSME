# Edge AI Predictive Maintenance System

A complete full-stack web application designed for an industrial manufacturing environment. It monitors industrial machine health using an ESP32 sensor node, a TX PC (processing server), and an RX PC (dashboard computer) in a local network without requiring cloud services.

## System Architecture

```
ESP32 Sensor Node 
       ↓ (Wi-Fi: HTTP POST)
    TX PC Server (Node.js AI Engine & WebSocket Server)
       ↓ (Wi-Fi/LAN: WebSockets)
RX PC Dashboard (React/Vite Real-time UI)
```

## Features
- **Real-time Monitoring:** Low latency data pipeline using WebSockets.
- **Edge AI Prediction:** Rule-based anomaly engine calculating Health Score, Anomaly Score, and Maintenance Risk.
- **Vibration Analysis:** Dedicated panel tracking X, Y, Z axes, Peak, and RMS vibrations.
- **Simulation Mode:** Built-in data simulator for testing the UI without physical ESP32 hardware.
- **Industrial UI:** Premium dark mode aesthetic suitable for heavy manufacturing plants.

---

## Installation & Setup

### 1. TX PC (Backend Server)

This server processes ESP32 data and hosts the WebSockets server for the dashboard.

1. Install Node.js (v18+).
2. Open a terminal and navigate to the backend folder:
   ```bash
   cd tx-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```
5. Note the TX PC's IP address. On Windows, run `ipconfig` (look for "IPv4 Address"). Let's assume it is `192.168.1.100`.

### 2. RX PC (Dashboard)

This is the computer that displays the monitoring UI.

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`. Update it with the IP address of your TX PC:
   ```env
   VITE_TX_SERVER_URL=ws://192.168.1.100:8080
   ```
   *(If you are running both frontend and backend on the same computer, you can use `ws://127.0.0.1:8080`)*
4. Start the dashboard:
   ```bash
   npm run dev
   ```
5. Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

### 3. ESP32 (Sensor Node)

1. Open `esp32/sensor_transmitter.ino` in the Arduino IDE.
2. Update the Wi-Fi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Update the `serverUrl` with the IP address of your TX PC:
   ```cpp
   const char* serverUrl = "http://192.168.1.100:8080/api/data";
   ```
4. Compile and upload to the ESP32.

---

## Testing / Simulation Mode

If you don't have an ESP32 connected, you can still test the entire system:
1. Ensure both the TX Server and RX Dashboard are running.
2. Open the Dashboard in your browser.
3. Click the **"SIMULATION OFF"** button in the top right corner. It will turn on and begin broadcasting realistic sensor data with occasional anomalies to trigger the predictive maintenance alerts.

## Troubleshooting

- **ESP32 won't connect:** Ensure the ESP32 and TX PC are on the same Wi-Fi network. Check the Arduino Serial Monitor (baud 115200).
- **Dashboard says DISCONNECTED:** The frontend cannot reach the WebSocket server. Check that the `VITE_TX_SERVER_URL` in your `.env` file points to the correct IP of the TX PC. Ensure no firewalls on the TX PC are blocking port `8080`.
- **Invalid data errors:** If passing real sensor data, ensure it matches the expected JSON format.

### Example JSON Payload (ESP32 -> TX PC)
```json
{
  "machineId": "MOTOR-01",
  "temperature": 72.5,
  "humidity": 48.2,
  "vibrationX": 0.21,
  "vibrationY": 0.18,
  "vibrationZ": 0.35,
  "current": 8.6
}
```
