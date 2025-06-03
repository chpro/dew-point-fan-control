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
const INDOOR_HUMIDITY_MIN = 50;
const UPDATE_INTERVAL_MS = 10 * 10 * 1000; // in milli seconds

function udpateSwitch() {
    // call remote api
    Shelly.call(
        "http.get", {
            url: "http://dewpointws.localdomain"
        },
        function (response, error_code, error_message, ud) {
            if (error_code !== 0) {
                console.log("Error getting data: ", {"code": error_code, "message" : error_message});
                return;
            } 
            // get the current switch status
            const respBody = JSON.parse(response.body);
            configureLight(respBody);
            Shelly.call(
                "switch.getStatus",
                { id: 0 },
                function (res, error_code, error_msg, ud) {
                    var switchOn = res.output;
                    Shelly.call("Switch.Set", {id:0, on: caclulateSwitchOn(respBody.indoor, respBody.outdoor, switchOn)}); 
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
    if (indoor.humidity < INDOOR_HUMIDITY_MIN) {
        console.log("Switch off because indoor humidity to low", indoor);
        return false;
    } else if (indoor.temperature < INDOOR_TEMP_MIN) {
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

function configureLight(measures) {
    var humidity = measures.indoor.humidity;
    var shellyRgb = null;
    if (humidity < INDOOR_HUMIDITY_MIN) { // green
        shellyRgb = [0, 100 , 0];
    } else if (humidity >= 65) { // red
        shellyRgb = [100, 0 , 0];
    } else { // lilac
        shellyRgb = [75, 0 , 100];
    }
    console.log("Seti light to ", shellyRgb, " because of humidit ", humidity);
    _configureLight(shellyRgb, 100, 10);
}

/**
 * 
 * @param {Array} shellyRGB - array of numbers or null. Value for red [0-100], green [0-100] and blue [0-100] 
 * @param {number} onBrightness - Value for brightness [0-100] when switch is on
 * @param {number} offBrightness - Value for brightness [0-100] when switch is off
 */
function _configureLight(shellyRGB, onBrightness, offBrightness) {
    Shelly.call("PLUGS_UI.GetConfig",null, function(uiConfig, error_code, error_message) {
        uiConfig.leds.colors["switch:0"].on.rgb = shellyRGB
        uiConfig.leds.colors["switch:0"].on.brightness=onBrightness
        uiConfig.leds.colors["switch:0"].off.rgb = shellyRGB
        uiConfig.leds.colors["switch:0"].off.brightness=offBrightness

        uiConfig.leds.mode = "switch"
        Shelly.call("PLUGS_UI.SetConfig", {config: uiConfig}, function(response, error_code, error_message){console.log(response, error_code, error_message)})
    })
}

function startTimer() {
    Timer.set(UPDATE_INTERVAL_MS, true, udpateSwitch)
}

udpateSwitch();
startTimer();

// script end

module.exports ={calculateDewPoint, caclulateSwitchOn, HYSTERESE, DEW_POINT_DELTA_MIN, INDOOR_TEMP_MIN, OUTDOOR_TEMP_MIN, INDOOR_HUMIDITY_MIN} 