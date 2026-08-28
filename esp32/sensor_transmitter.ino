#include <WiFi.h>
#include <HTTPClient.h>

// ---------------------------------------------------------
// Configuration
// ---------------------------------------------------------
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// IP address of the TX PC running the Node.js server
const char* serverUrl = "http://192.168.1.100:8080/api/data"; 

const String machineId = "MOTOR-01";

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000; // 2 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    } else {
      Serial.println("WiFi Disconnected!");
    }
  }
}

void sendSensorData() {
  HTTPClient http;
  
  // Here we simulate reading from actual sensors (DHT11, MPU6050, ACS712)
  // In a real scenario, you'd replace these with actual sensor readings.
  float temp = 65.0 + random(-50, 50) / 10.0;
  float humidity = 45.0 + random(-50, 50) / 10.0;
  float vx = 0.2 + random(-10, 10) / 100.0;
  float vy = 0.15 + random(-10, 10) / 100.0;
  float vz = 0.3 + random(-10, 10) / 100.0;
  float current = 7.5 + random(-15, 15) / 10.0;
  
  // Create JSON payload manually or use ArduinoJson library
  String payload = "{";
  payload += "\"machineId\":\"" + machineId + "\",";
  payload += "\"temperature\":" + String(temp, 1) + ",";
  payload += "\"humidity\":" + String(humidity, 1) + ",";
  payload += "\"vibrationX\":" + String(vx, 2) + ",";
  payload += "\"vibrationY\":" + String(vy, 2) + ",";
  payload += "\"vibrationZ\":" + String(vz, 2) + ",";
  payload += "\"current\":" + String(current, 1);
  payload += "}";
  
  Serial.println("Sending data: " + payload);
  
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
