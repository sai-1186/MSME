const thresholds = require('../config/thresholds');

function analyzeMachineHealth(data) {
  let riskScore = 0;
  let recommendations = [];
  
  const { temperature, current, vibrationX, vibrationY, vibrationZ, humidity } = data;
  
  const maxVibration = Math.max(
    Math.abs(vibrationX),
    Math.abs(vibrationY),
    Math.abs(vibrationZ)
  );
  
  if (temperature >= thresholds.temperature.critical) {
    riskScore += 40;
    recommendations.push("Inspect cooling system");
  } else if (temperature >= thresholds.temperature.warning) {
    riskScore += 15;
    recommendations.push("Check cooling system");
  }
  
  if (current >= thresholds.current.critical) {
    riskScore += 40;
    recommendations.push("Inspect motor load/electrical system");
  } else if (current >= thresholds.current.warning) {
    riskScore += 15;
    recommendations.push("Monitor electrical load");
  }
  
  if (maxVibration >= thresholds.vibration.critical) {
    riskScore += 40;
    recommendations.push("Inspect motor bearings/alignment");
  } else if (maxVibration >= thresholds.vibration.warning) {
    riskScore += 15;
    recommendations.push("Check vibration levels");
  }
  
  if (humidity >= thresholds.humidity.critical) {
    riskScore += 10;
    recommendations.push("Check enclosure/environmental conditions");
  }
  
  let healthScore = Math.max(0, 100 - riskScore);
  
  let status = "HEALTHY";
  let riskLevel = "LOW";
  let finalRecommendation = "No maintenance required";
  
  if (healthScore < 50) {
    status = "CRITICAL";
    riskLevel = "HIGH";
    finalRecommendation = recommendations.length > 1 ? "Schedule preventive maintenance" : recommendations[0];
  } else if (healthScore < 85) {
    status = "WARNING";
    riskLevel = "MEDIUM";
    finalRecommendation = recommendations[0];
  }
  
  return {
    vibrationRMS: Math.sqrt((vibrationX**2 + vibrationY**2 + vibrationZ**2)/3).toFixed(2),
    healthScore,
    anomalyScore: (riskScore / 100).toFixed(2),
    status,
    riskLevel,
    recommendation: finalRecommendation,
    timestamp: new Date().toISOString()
  };
}

module.exports = { analyzeMachineHealth };
