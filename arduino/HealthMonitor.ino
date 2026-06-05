#include <LiquidCrystal.h>

/*
  Arduino UNO/Nano sketch:
  - Reads pulse sensor on D7 (digital) and LM35 on A0
  - Updates a 16x2 LCD
  - Streams data to NodeMCU over Serial as: bpm,tempC\n

  NodeMCU (ESP8266) side uses SoftwareSerial(D1, D2) at 9600
  - NodeMCU D1 (GPIO5)  <= Arduino TX (D1)  (use level shifting / resistor divider!)
  - NodeMCU D2 (GPIO4)  => Arduino RX (D0)  (optional; not used in this project)
  - Common GND required
*/

/* LCD wiring (UNO pins): RS=12, E=11, D4=5, D5=4, D6=3, D7=2 */
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

/* Pins */
const uint8_t TEMP_PIN = A0;  // LM35 temp sensor analog input
const uint8_t HB_SENSOR = 7;  // Pulse sensor digital input

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

/* Measurement state */
unsigned long lastBpmWindowStartMs = 0;
unsigned long lastTempSampleMs = 0;

int beatCount = 0;
int bpm = 0;
float tempC = 0.0f;

void setup() {
  // Must match NodeMCU SoftwareSerial baud
  Serial.begin(9600);

  pinMode(HB_SENSOR, INPUT);

  lcd.begin(16, 2);
  lcd.createChar(0, heartGlyph);
  lcd.createChar(1, tempGlyph);

  lcd.setCursor(3, 0);
  lcd.print("Health");
  lcd.setCursor(2, 1);
  lcd.print("Monitoring");
  delay(1500);
  lcd.clear();

  lastBpmWindowStartMs = millis();
  lastTempSampleMs = millis();
}

static float readLm35TempC() {
  const int adc = analogRead(TEMP_PIN);
  const float voltage = adc * (5.0f / 1023.0f);
  return voltage * 100.0f; // LM35: 10mV/°C
}

void loop() {
  const unsigned long now = millis();

  // Temperature sample every 2 seconds
  if (now - lastTempSampleMs >= 2000) {
    tempC = readLm35TempC();
    lastTempSampleMs = now;
  }

  // Pulse detection: count rising edges on digital pin
  const int pulseVal = digitalRead(HB_SENSOR);
  static int prevPulseVal = LOW;
  if (pulseVal == HIGH && prevPulseVal == LOW) {
    beatCount++;
  }
  prevPulseVal = pulseVal;

  // BPM update window: 10 seconds => multiply by 6 to get BPM
  if (now - lastBpmWindowStartMs >= 10000) {
    bpm = beatCount * 6;
    beatCount = 0;
    lastBpmWindowStartMs = now;

    // Emit one line for NodeMCU: "bpm,tempC\n"
    Serial.print(bpm);
    Serial.print(',');
    Serial.println(tempC, 1);
  }

  // LCD output
  lcd.setCursor(0, 0);
  lcd.write(byte(1));
  lcd.print(" Temp: ");
  lcd.print(tempC, 1);
  lcd.print(" C ");

  lcd.setCursor(0, 1);
  lcd.write(byte(0));
  lcd.print(" BPM: ");
  lcd.print(bpm);
  lcd.print("     ");

  delay(25);
}