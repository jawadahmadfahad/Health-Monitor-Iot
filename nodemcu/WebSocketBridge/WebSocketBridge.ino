#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

/* WiFi Credentials */
const char* ssid = "PTCL-BB";
const char* password = "92b5bf4e";

/* SoftwareSerial Setup (D1 = GPIO5 = RX from Arduino, D2 = GPIO4 = TX to Arduino) */
SoftwareSerial arduinoSerial(D1, D2); // RX, TX

/* WebSocket Server on port 8080 */
WebSocketsServer webSocket = WebSocketsServer(8080);

/* JSON document for data */
StaticJsonDocument<200> doc;

void setup() {
  Serial.begin(115200);         // Debug Serial Monitor
  arduinoSerial.begin(9600);    // Match Arduino baud rate
  delay(1000);

  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port 8080");
}

void loop() {
  webSocket.loop();

  if (arduinoSerial.available()) {
    String rawData = arduinoSerial.readStringUntil('\n');
    rawData.trim();
    
    if (rawData.length() > 0) {
      Serial.println("From Arduino: " + rawData);

      // Parse comma-separated values
      int commaIndex = rawData.indexOf(',');
      if (commaIndex > 0) {
        String bpmStr = rawData.substring(0, commaIndex);
        String tempStr = rawData.substring(commaIndex + 1);

        // Convert strings to numbers
        int bpm = bpmStr.toInt();
        float temp = tempStr.toFloat();

        // Create JSON document
        doc.clear();
        doc["heartRate"] = bpm;
        doc["temperature"] = temp;

        // Serialize to string
        String jsonString;
        serializeJson(doc, jsonString);

        // Broadcast to all clients
        webSocket.broadcastTXT(jsonString);
        Serial.println("Broadcasted: " + jsonString);
      }
    }
  }

  // Small delay to prevent overwhelming the serial buffer
  delay(10);
}

/* WebSocket Event Handler */
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("Client [%u] connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Send initial data to newly connected client
        doc["heartRate"] = 0;
        doc["temperature"] = 0;
        String jsonString;
        serializeJson(doc, jsonString);
        webSocket.sendTXT(num, jsonString);
      }
      break;
      
    case WStype_DISCONNECTED:
      Serial.printf("Client [%u] disconnected\n", num);
      break;
      
    case WStype_TEXT:
      Serial.printf("Received from client [%u]: %s\n", num, payload);
      break;
      
    case WStype_ERROR:
      Serial.printf("Error [%u]\n", num);
      break;
  }
}