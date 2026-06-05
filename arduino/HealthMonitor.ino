#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <TimerOne.h>
#include <LiquidCrystal.h>

/* WiFi credentials */
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

/* WebSocket server */
WebSocketsServer webSocket = WebSocketsServer(8080);

/* LCD wiring */
LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS=12, E=11, D4=5, D5=4, D6=3, D7=2

/* Pins */
const byte TEMP_PIN = A0;  // LM35 temp sensor analog input
const byte HB_SENSOR = 7;  // Pulse sensor digital input

/* Custom chars */
byte heartGlyph[8] = {
  0b00000,
  0b01010,
  0b11111,
  0b11111,
  0b01110,
  0b00100,
  0b00000,
  0b00000
};

byte tempGlyph[8] = {
  0b00100,
  0b01010,
  0b01010,
  0b01110,
  0b11111,
  0b11111,
  0b01110,
  0b00000
};

/* Pulse detection variables */
const int Highpulse = HIGH;  // since digitalRead, HIGH means pulse detected
unsigned long lastBeatTime = 0;
unsigned long lastBPMUpdate = 0;
int beatCount = 0;
int bpm = 0;

unsigned long lastTempUpdate = 0;
int temp = 0;

/* WebSocket event handler */
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      }
      break;
    case WStype_TEXT:
      Serial.printf("[%u] get Text: %s\n", num, payload);
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // LCD Setup
  lcd.begin(16, 2);
  lcd.createChar(0, heartGlyph);
  lcd.createChar(1, tempGlyph);
  pinMode(HB_SENSOR, INPUT);

  // Splash screen
  lcd.setCursor(3, 0);
  lcd.print("Health");
  lcd.setCursor(2, 1);
  lcd.print("Monitoring");
  delay(2000);
  lcd.clear();
}

void loop() {
  webSocket.loop();
  unsigned long currentMillis = millis();

  // Read temperature every 2 seconds
  if (currentMillis - lastTempUpdate >= 2000) {
    int adc = analogRead(TEMP_PIN);
    float voltage = adc * (5.0 / 1023.0);
    temp = voltage * 100; // LM35: 10mV/°C
    lastTempUpdate = currentMillis;
    
    // Send data to WebSocket clients
    StaticJsonDocument<200> doc;
    doc["heartRate"] = bpm;
    doc["temperature"] = temp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    webSocket.broadcastTXT(jsonString);
  }

  // Pulse detection: detect rising edge on digital pin 7
  int pulseVal = digitalRead(HB_SENSOR);
  static bool pulsePrevState = LOW;

  if (pulseVal == HIGH && pulsePrevState == LOW) {
    // Rising edge detected: count beat
    beatCount++;
    lastBeatTime = currentMillis;
  }
  pulsePrevState = pulseVal;

  // Update BPM every 10 seconds (or 60000 ms for 1 min scale)
  if (currentMillis - lastBPMUpdate >= 10000) {
    bpm = beatCount * 6; // scale 10s count to 60s
    beatCount = 0;
    lastBPMUpdate = currentMillis;
  }

  // Display on LCD
  lcd.setCursor(0, 0);
  lcd.write(byte(1));           // Temp glyph
  lcd.print(" Temp: ");
  lcd.print(temp);
  lcd.print(" C  ");

  lcd.setCursor(0, 1);
  lcd.write(byte(0));           // Heart glyph
  lcd.print(" BPM: ");
  lcd.print(bpm);
  lcd.print("    ");

  delay(50);
}