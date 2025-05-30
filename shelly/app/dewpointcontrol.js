if (typeof Timer === 'undefined') {
    const Timer = require("../test/shellymock").Timer
}

if (typeof Shelly === 'undefined') {
    const Shelly = require("../test/shellymock").Shelly
} 

// script start
const HYSTERESE = 2;
const DEW_POINT_DELTA_MIN = 3;
const INDOOR_TEMP_MIN = 10.0;
const OUTDOOR_TEMP_MIN = -10.0;
const UPDATE_INTERVAL_MS = 10 * 1000; // in milli seconds

function udpateSwitch() {
    // call remote api
    Shelly.call(
        "http.get", {
            url: 'URL todo'
        },
        function (response, error_code, error_message, ud) {
                // get the current switch status
            Shelly.call(
                "switch.getStatus",
                { id: 0 },
                function (res, error_code, error_msg, ud) {
                    var switchOn = res.output;
                    Shelly.call("Switch.Set", {id:0, on: caclulateSwitchOn(response.indoor, response.outdoor, switchOn)}); 
                },
                null
            );
        },
        null
    );

}

/**
 * Calcualtes if the switch should be sent to on or off
 * @param {Object} indoor - The object which holds indoor temperature and relative humidity
 * @param {Object} outdoor - The object which holds outdoor temperature and relative humidity
 * @param {boolean} switchOn - true if switch is currently on else false. Will be returned as default behavior
 * @returns {boolean} true if switch should be switchted on otherwise false
 */
function caclulateSwitchOn(indoor, outdoor, switchOn) {
    const delta = calculateDewPoint(indoor.temperature, indoor.humidity) - calculateDewPoint(outdoor.temperature, outdoor.humidity);
    console.log("Dew point delta " + delta + " for indoor ", indoor, "and outdoor ", outdoor);
    if (indoor.temperature < INDOOR_TEMP_MIN) {
        console.log("Switch off because indoor temperature to low", indoor);
        return false;
    } else if(outdoor.temperature < OUTDOOR_TEMP_MIN) {
        console.log("Switch off because outdoor temperature to low", outdoor);
        return false;
    } else if (delta >= (DEW_POINT_DELTA_MIN + HYSTERESE)) {
        console.log("Switch on");
        return true;
    } else if (delta < DEW_POINT_DELTA_MIN) {
        console.log("Switch off because dew point delta to small");
        return false;
    } else {
        console.log("No switch status change. Keeping switch " + (switchOn ? "on" : "off"));
        return switchOn;
    } 
}

/**
 * Calculates the dew point temperature in Celsius.
 * @param {number} temperature - The air temperature in Celsius.
 * @param {number} humidity - The relative humidity (0-100%).
 * @returns {number} The dew point temperature in Celsius.
 */
function calculateDewPoint(temperature, humidity) {
    if (temperature >= 0) {
        return _calculateDewPoint(17.27, 237.7, temperature, humidity);
    } else {
        return _calculateDewPoint(17.966, 247.15, temperature, humidity);
    }
}

/**
 * Calculates the dew point temperature in Celsius.
 * @param {number} a - constant for formula see https://en.wikipedia.org/wiki/Dew_point
 * @param {number} b - constant for formula see https://en.wikipedia.org/wiki/Dew_point
 * @param {number} temperature - The air temperature in Celsius.
 * @param {number} humidity - The relative humidity (0-100%).
 * @returns {number} The dew point temperature in Celsius.
 */
function _calculateDewPoint(a, b, temperature, humidity) {
    const alpha = (a * temperature) / (b + temperature) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    
    return dewPoint;
}

function startTimer() {
    Timer.set(UPDATE_INTERVAL_MS, true, udpateSwitch)
}

startTimer();

// script end

module.exports ={calculateDewPoint, caclulateSwitchOn, HYSTERESE, DEW_POINT_DELTA_MIN, MIN_INDOOR_TEMP: INDOOR_TEMP_MIN, MIN_OUTDOOR_TEMP: OUTDOOR_TEMP_MIN} 