# 🌡️ Smart Fan Control with ESP8266, DHT22 & Shelly Plug

This project uses an **ESP8266** microcontroller and **DHT22** sensors to monitor indoor and outdoor temperature and humidity. The data is exposed via a **REST API** and consumed by a **Shelly Plug** script, which automatically controls a fan based on real-time environmental conditions.

---

## 🚀 Features

- 📡 Real-time data collection with ESP8266
- 🌬️ Indoor & outdoor temperature and humidity monitoring
- 🔌 Smart fan automation via Shelly Plug scripting
- 🌐 RESTful API for seamless data access

---

## 🧠 Use Case

Perfect for smart home environments where automated ventilation is needed based on temperature and humidity thresholds—ideal for rooms with poor airflow, greenhouses, or server closets.

---

## 🛠️ Arduino IDE Setup

**Recommended Version:** 2.3.6

### 🔌 Pin Overview

Refer to the WeMos D1 Pinout for wiring details. https://github.com/corerd/WeMosD1

### 📥 Install ESP8266 Board Support

Follow this guide: Getting Started with ESP8266

https://lastminuteengineers.com/getting-started-with-esp8266/#installing-the-esp8266-core


**Board Manager URL:**

```
http://arduino.esp8266.com/stable/package_esp8266com_index.json
```

**Board Settings:**

- Board: *"Wemos D1 pro"*
- Upload Speed: `115200`

### 📚 Required Libraries

- **ArduinoJson**  
  Handling JSON with ESP8266 https://medium.com/@punnyarthabanerjee/esp8266-handling-data-in-json-7c6f62c9062e

- **DHT Sensor Library**  
  DHT22 with ESP8266 Tutorial https://lastminuteengineers.com/esp8266-dht11-dht22-web-server-tutorial/

---

## 📡 REST API

- **Endpoint:** `/`
- **Port:** `8080`

### 📦 Sample JSON Response

```json
{
  "indoor": {
    "temperature": 22.8,
    "humidity": 53.5
  },
  "outdoor": {
    "temperature": 22.9,
    "humidity": 53.5
  }
}
```
