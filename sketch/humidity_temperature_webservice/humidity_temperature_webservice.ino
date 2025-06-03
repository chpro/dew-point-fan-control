#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include "wifi.h"
#include "DHT.h"
// DHT22:   PIN 1:  VCC     mit 3,3 oder 5V verbinden (funzte beides)
//          PIN 2:  Data    mit D2 oder D6 funktioniert es, an D8 auch aber dann lässt sich der ESP8266 nicht mehr flashen. Spannungsteiler mit 10K Widerstand
//                          Siehe Zeichnung wemos_d1_mini_dht22_bb.jpg im Verzeichnis dieses Skriptes
//          PIN 3:  NC      bleibt unbelegt
//          PIN 4:  GND     mit Masse / G verbinden

// Typ des Sensors, hier DHT22
//#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT21   // DHT 21 (AM2301)
#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321

// defined in wifi.h
//const char* ssid = "";
//const char* password = "";

ESP8266WebServer server(80);

// DHT Sensor
// D2; 
const uint8_t INDOOR_DHT_PIN = 4;
// D6
const uint8_t OUTDOOR_DHT_PIN = 12;
               
// Initialize DHT sensor.
DHT indoorDht(INDOOR_DHT_PIN, DHTTYPE);
DHT outdoorDht(OUTDOOR_DHT_PIN, DHTTYPE);

float indoorTemperature = 0;
float indoorHumidity = 0;
float outdoorTemperature = 0;
float outdoorHumidity = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  pinMode(INDOOR_DHT_PIN, INPUT);
  pinMode(OUTDOOR_DHT_PIN, INPUT);

  indoorDht.begin();
  outdoorDht.begin();           

  Serial.println("Connecting to ");
  Serial.println(ssid);

  //connect to your local wi-fi network
  WiFi.begin(ssid, password);

  //check wi-fi is connected to wi-fi network
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");  Serial.println(WiFi.localIP());

  server.on("/", handle_OnConnect);
  server.onNotFound(handle_NotFound);

  server.begin();
  Serial.println("HTTP server started");

}
void loop() {
  
  server.handleClient();
  
}

void handle_OnConnect() {

  indoorTemperature  = indoorDht.readTemperature();
  indoorHumidity = indoorDht.readHumidity();
  outdoorTemperature  = outdoorDht.readTemperature();
  outdoorHumidity = outdoorDht.readHumidity(); 
  server.send(200, "text/html", createJson(indoorTemperature, indoorHumidity, outdoorTemperature, outdoorHumidity)); 
}

void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}

String createJson(float indoorTemperature,float indoorHumidity, float outdoorTemperature,float outdoorHumidity){
  StaticJsonDocument<1000> doc;
  JsonObject indoor = doc.createNestedObject("indoor");
  indoor["temperature"]= indoorTemperature;
  indoor["humidity"]= indoorHumidity;

  JsonObject outdoor = doc.createNestedObject("outdoor");
  outdoor["temperature"]= outdoorTemperature;
  outdoor["humidity"]= outdoorHumidity;

  char data[1000];
    // Converts the JSON object to String and stores it in data variable
  serializeJson(doc, data);

  return String(data);
}