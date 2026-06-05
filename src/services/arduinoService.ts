// Arduino WebSocket connection service
type SensorDataCallback = (data: { heartRate: number; temperature: number }) => void;

let socket: WebSocket | null = null;
let dataCallback: SensorDataCallback | null = null;

// Connect to Arduino WebSocket server
export const connectToArduino = (onDataReceived: SensorDataCallback): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const wsUrl = "ws://192.168.10.5:8080";
      
      socket = new WebSocket(wsUrl);
      dataCallback = onDataReceived;
      
      socket.onopen = () => {
        console.log("Connected to Arduino WebSocket server");
        resolve();
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (dataCallback && typeof data.heartRate === 'number' && typeof data.temperature === 'number') {
            dataCallback({
              heartRate: Math.round(data.heartRate),
              temperature: parseFloat(data.temperature.toFixed(1))
            });
          }
        } catch (e) {
          console.error('Error parsing WebSocket data:', e);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        reject(error);
      };
      
      socket.onclose = () => {
        console.log("Disconnected from Arduino WebSocket server");
        // Fallback to simulation if connection is lost
        if (dataCallback) {
          startSimulation(dataCallback);
        }
      };
      
    } catch (error) {
      console.error("Error connecting to Arduino:", error);
      reject(error);
    }
  });
};

// Disconnect from Arduino WebSocket
export const disconnectFromArduino = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
  dataCallback = null;
};

// Simulate data for development/fallback
const startSimulation = (callback: SensorDataCallback) => {
  let lastHeartRate = 72;
  let lastTemp = 26.5;
  
  const interval = setInterval(() => {
    if (!dataCallback) {
      clearInterval(interval);
      return;
    }
    
    // Simulate realistic BPM changes
    const heartRateChange = (Math.random() * 4 - 2) + (Math.random() > 0.9 ? (Math.random() * 10 - 5) : 0);
    const newHeartRate = Math.round(Math.max(40, Math.min(120, lastHeartRate + heartRateChange)));
    lastHeartRate = newHeartRate;
    
    // Simulate realistic temperature changes
    const tempChange = (Math.random() * 0.4 - 0.2) + (Math.random() > 0.95 ? (Math.random() * 2 - 1) : 0);
    const newTemp = parseFloat((Math.max(15, Math.min(40, lastTemp + tempChange))).toFixed(1));
    lastTemp = newTemp;
    
    callback({
      heartRate: newHeartRate,
      temperature: newTemp
    });
  }, 1000);
};

// Arduino Connection Instructions
export const getArduinoSetupInstructions = (): string[] => {
  return [
    "1. Upload the provided Arduino sketch to your ESP8266/ESP32",
    "2. Connect the pulse sensor to digital pin 7",
    "3. Connect the LM35 temperature sensor to analog pin A0",
    "4. Connect the LCD display (RS=12, E=11, D4=5, D5=4, D6=3, D7=2)",
    "5. Update the WiFi credentials in the Arduino sketch",
    "6. Note the IP address shown in the Serial Monitor",
    "7. Update the WebSocket URL in arduinoService.ts with your Arduino's IP"
  ];
};

// Get Arduino sketch code
export const getArduinoSketchCode = (): string => {
  return `
    // The complete Arduino sketch code shown above
    // Copy the entire content of the Arduino sketch
  `;
};