/*
  ESP32 sensor node: ACS712 + MPU6050 + DHT11 + ST7735 display.

  Required libraries: Adafruit GFX, Adafruit ST7735 and ST77xx,
  Adafruit MPU6050, Adafruit Unified Sensor, and DHT sensor library.
*/

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// ---------- Network ----------
const char *ssid = "Sai's net";
const char *password = "sai@1186";
const char *serverUrl = "http://192.168.32.237:8080/api/data";
const char *machineId = "MOTOR-01";

// ---------- Pins ----------
constexpr uint8_t TFT_CS = 5;
constexpr uint8_t TFT_DC = 16;
constexpr uint8_t TFT_RST = 17;
constexpr uint8_t DHT_PIN = 4;
constexpr uint8_t CURRENT_SENSOR_PIN = 34;  // ADC1: usable while Wi-Fi is active
constexpr uint8_t I2C_SDA = 21;
constexpr uint8_t I2C_SCL = 22;

constexpr uint8_t DHT_TYPE = DHT11;
constexpr float ADC_MAX = 4095.0f;
constexpr float VREF = 3.3f;
constexpr float ACS712_SENSITIVITY = 0.100f;  // 20 A ACS712: 100 mV/A
constexpr float STANDARD_GRAVITY = 9.80665f;  // m/s² per g

constexpr unsigned long ACS_INTERVAL = 500;
constexpr unsigned long MPU_INTERVAL = 100;
constexpr unsigned long DHT_INTERVAL = 2000;
constexpr unsigned long DISPLAY_INTERVAL = 500;
constexpr unsigned long SEND_INTERVAL = 2000;

Adafruit_ST7735 tft(TFT_CS, TFT_DC, TFT_RST);
Adafruit_MPU6050 mpu;
DHT dht(DHT_PIN, DHT_TYPE);

bool mpuAvailable = false;
int acsZeroRaw = 0;

float lastTempC = NAN;
float lastHum = NAN;
float lastCurrentA = 0.0f;
float lastAccelX = 0.0f;
float lastAccelY = 0.0f;
float lastAccelZ = 0.0f;

unsigned long lastACSMillis = 0;
unsigned long lastMPUMillis = 0;
unsigned long lastDHTMillis = 0;
unsigned long lastDisplayMillis = 0;
unsigned long lastSendMillis = 0;
unsigned long lastWiFiAttemptMillis = 0;

void connectWiFi();
void calibrateACS712(uint16_t samples);
float readACS712Current(uint16_t samples);
void readSensors(unsigned long now);
void sendSensorData();
void drawLayout();
void drawValues();

void setup() {
  Serial.begin(115200);
  delay(200);

  Wire.begin(I2C_SDA, I2C_SCL);
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1);  // 160 x 128 landscape
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextWrap(false);

  dht.begin();
  analogSetWidth(12);
  analogSetPinAttenuation(CURRENT_SENSOR_PIN, ADC_11db);

  mpuAvailable = mpu.begin();
  if (mpuAvailable) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  } else {
    Serial.println("MPU6050 not found; check I2C wiring.");
  }

  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(1);
  tft.setCursor(8, 56);
  tft.print("Calibrating ACS712...");
  // Ensure the monitored load is off during this measurement.
  calibrateACS712(500);

  drawLayout();
  connectWiFi();
  lastDHTMillis = millis() - DHT_INTERVAL;
}

void loop() {
  const unsigned long now = millis();
  readSensors(now);

  if (now - lastDisplayMillis >= DISPLAY_INTERVAL) {
    drawValues();
    lastDisplayMillis = now;
  }

  if (WiFi.status() != WL_CONNECTED && now - lastWiFiAttemptMillis >= 10000) {
    connectWiFi();
  }

  if (WiFi.status() == WL_CONNECTED && now - lastSendMillis >= SEND_INTERVAL) {
    lastSendMillis = now;
    sendSensorData();
  }
}

void connectWiFi() {
  lastWiFiAttemptMillis = millis();
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  const unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 10000) {
    delay(250);
    Serial.print('.');
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nWi-Fi IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWi-Fi unavailable; retrying later.");
  }
}

void readSensors(unsigned long now) {
  if (now - lastACSMillis >= ACS_INTERVAL) {
    lastCurrentA = readACS712Current(100);
    lastACSMillis = now;
  }

  if (mpuAvailable && now - lastMPUMillis >= MPU_INTERVAL) {
    sensors_event_t acceleration, gyro, temperature;
    mpu.getEvent(&acceleration, &gyro, &temperature);
    // The MPU6050 library returns m/s². The API and dashboard use g.
    lastAccelX = acceleration.acceleration.x / STANDARD_GRAVITY;
    lastAccelY = acceleration.acceleration.y / STANDARD_GRAVITY;
    lastAccelZ = acceleration.acceleration.z / STANDARD_GRAVITY;
    lastMPUMillis = now;
  }

  if (now - lastDHTMillis >= DHT_INTERVAL) {
    const float temperature = dht.readTemperature();
    const float humidity = dht.readHumidity();
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("DHT11 read failed.");
    } else {
      lastTempC = temperature;
      lastHum = humidity;
    }
    lastDHTMillis = now;
  }
}

void calibrateACS712(uint16_t samples) {
  uint32_t sum = 0;
  for (uint16_t i = 0; i < samples; ++i) {
    sum += analogRead(CURRENT_SENSOR_PIN);
    delay(2);
  }
  acsZeroRaw = sum / samples;
  Serial.printf("ACS712 baseline: %d (%.3f V)\n", acsZeroRaw,
                acsZeroRaw * VREF / ADC_MAX);
}

float readACS712Current(uint16_t samples) {
  uint32_t sum = 0;
  for (uint16_t i = 0; i < samples; ++i) {
    sum += analogRead(CURRENT_SENSOR_PIN);
  }
  const float average = static_cast<float>(sum) / samples;
  const float voltageDelta = (average - acsZeroRaw) * VREF / ADC_MAX;
  return voltageDelta / ACS712_SENSITIVITY;
}

void sendSensorData() {
  HTTPClient http;
  String payload = "{\"machineId\":\"" + String(machineId) + "\",";
  payload += "\"temperature\":" + String(isnan(lastTempC) ? 0.0f : lastTempC, 1) + ",";
  payload += "\"humidity\":" + String(isnan(lastHum) ? 0.0f : lastHum, 1) + ",";
  payload += "\"vibrationX\":" + String(lastAccelX, 2) + ",";
  payload += "\"vibrationY\":" + String(lastAccelY, 2) + ",";
  payload += "\"vibrationZ\":" + String(lastAccelZ, 2) + ",";
  payload += "\"current\":" + String(lastCurrentA, 2) + "}";

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  const int status = http.POST(payload);
  Serial.printf("POST status: %d\n", status);
  if (status > 0) Serial.println(http.getString());
  http.end();
}

void drawLayout() {
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ST77XX_CYAN);
  tft.setCursor(4, 2);
  tft.print("Edge AI Node");
  tft.drawFastHLine(0, 21, tft.width(), ST77XX_BLUE);
  tft.setTextSize(1);
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(4, 30); tft.print("Current:");
  tft.setCursor(4, 54); tft.print("Temp/Hum:");
  tft.setCursor(4, 78); tft.print("Accel:");
  tft.setCursor(4, 108); tft.print("WiFi:");
}

void drawValues() {
  char line[40];
  tft.fillRect(64, 28, 94, 18, ST77XX_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ST77XX_YELLOW);
  snprintf(line, sizeof(line), "%5.2fA", lastCurrentA);
  tft.setCursor(64, 29); tft.print(line);

  tft.fillRect(64, 52, 96, 16, ST77XX_BLACK);
  tft.setTextSize(1);
  tft.setTextColor(ST77XX_GREEN);
  if (isnan(lastTempC) || isnan(lastHum)) snprintf(line, sizeof(line), "waiting");
  else snprintf(line, sizeof(line), "%.1fC  %.0f%%", lastTempC, lastHum);
  tft.setCursor(64, 55); tft.print(line);

  tft.fillRect(4, 88, 156, 15, ST77XX_BLACK);
  tft.setTextColor(ST77XX_ORANGE);
  snprintf(line, sizeof(line), "X:%+.1f Y:%+.1f Z:%+.1f", lastAccelX, lastAccelY, lastAccelZ);
  tft.setCursor(4, 91); tft.print(line);

  tft.fillRect(40, 106, 120, 15, ST77XX_BLACK);
  tft.setTextColor(WiFi.status() == WL_CONNECTED ? ST77XX_GREEN : ST77XX_RED);
  tft.setCursor(40, 109);
  tft.print(WiFi.status() == WL_CONNECTED ? "connected" : "disconnected");
}
