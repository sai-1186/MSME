function generateSimulatedData(machineId = "MOTOR-01") {
  // Base normal values
  let temp = 60 + Math.random() * 15; // 60-75
  let humidity = 40 + Math.random() * 20; // 40-60
  let vx = 0.1 + Math.random() * 0.3; // 0.1-0.4
  let vy = 0.1 + Math.random() * 0.3;
  let vz = 0.1 + Math.random() * 0.3;
  let current = 5 + Math.random() * 4; // 5-9

  // Occasional anomalies (approx 5% chance)
  if (Math.random() > 0.95) {
    const anomalyType = Math.floor(Math.random() * 3);
    if (anomalyType === 0) {
      temp += 20; // High temp
    } else if (anomalyType === 1) {
      vx += 0.8; // High vibration
      vz += 0.5;
    } else {
      current += 6; // High current
    }
  }

  return {
    machineId,
    temperature: parseFloat(temp.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    vibrationX: parseFloat(vx.toFixed(2)),
    vibrationY: parseFloat(vy.toFixed(2)),
    vibrationZ: parseFloat(vz.toFixed(2)),
    current: parseFloat(current.toFixed(1))
  };
}

module.exports = { generateSimulatedData };
