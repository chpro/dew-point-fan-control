if (typeof Timer === 'undefined' && typeof Shelly === 'undefined') {
    require("../test/shellymock").Timer
}


// script start
const HYSTERESE = 2;
const DEW_POINT_DELTA_MIN = 3;
const INDOOR_TEMP_MIN = 10.0;
const OUTDOOR_TEMP_MIN = -10.0;
const INDOOR_HUMIDITY_MIN = 50;
const INDOOR_HUMIDITY_MAX = 65;
const UPDATE_INTERVAL_MS = 10 * 60 * 1000; // in milli seconds
const SHELLY_RGB_COLOR_ERROR = [0, 0, 100];
const SHELLY_RGB_COLOR_HUMIDITY_DRY = [0, 100 , 0]; // below INDOOR_HUMIDITY_MIN
const SHELLY_RGB_COLOR_HUMIDITY_COMFORT_ZONE = [75, 0 , 100]; // between INDOOR_HUMIDITY_MIN and INDOOR_HUMIDITY_MAX
const SHELLY_RGB_COLOR_HUMIDITY_MOISTY = [100, 0 , 0]; // above INDOOR_HUMIDITY_MAX

const STATE_CHANGE_EVENT_URL = "http://tig.localdomain:9002/telegraf"; // post call is issued after switch state is changed with switch status and measurement info as json
const MEASUREMENTS_URL = "http://dewpointws.localdomain";

function udpateSwitch() {
    // call remote api
    Shelly.call(
        "http.get", {
            url: MEASUREMENTS_URL
        },
        function (response, error_code, error_message, ud) {
            if (errorHandler(response, error_code, error_message, ud)) {
                return;
            } 
            // get the current switch status
            const environmentalData = JSON.parse(response.body);
            configureLight(environmentalData);
            Shelly.call(
                "switch.getStatus",
                { id: 0 },
                function (response, error_code, error_message, ud) {
                    if (errorHandler(response, error_code, error_message, ud)) {
                        return;
                    } 
                    var switchOn = response.output;
                    var newSwitchOn = caclulateSwitchOn(environmentalData, switchOn);
                    Shelly.call("Switch.Set", {id:0, on: newSwitchOn}, function(response, error_code, error_message, ud) {
                        if (!errorHandler(response, error_code, error_message, ud)) {
                            sendStatusChange(environmentalData, newSwitchOn);
                        }
                    });
                },
                null
            );
        },
        null
    );

}

/**
 * 
 * @param {*} response 
 * @param {*} error_code 
 * @param {*} error_message 
 * @param {*} ud 
 * @returns True if error occured otherwise false
 */
function errorHandler(response, error_code, error_message, ud) {
    if (error_code !== 0) {
        console.log(new Date(), "Error occured ", {"code": error_code, "message" : error_message, "userData" : ud});
        _configureLight(SHELLY_RGB_COLOR_ERROR, 100, 100);
        return true;
    }
    return false;
}

/**
 * Calcualtes if the switch should be sent to on or off
 * @param {Object} environmentalData - containing indoor - The object which holds indoor temperature and relative humidity and outdoor - The object which holds outdoor temperature and relative humidity
 * @param {boolean} switchOn - true if switch is currently on else false. Will be returned as default behavior
 * @returns {boolean} true if switch should be switchted on otherwise false
 */
function caclulateSwitchOn(environmentalData, switchOn) {
    console.log(environmentalData);
    const indoorDewPoint = calculateDewPoint(environmentalData.indoor.temperature, environmentalData.indoor.humidity);
    const outdoorDewPoint = calculateDewPoint(environmentalData.outdoor.temperature, environmentalData.outdoor.humidity);
    // add dew point to environmentalData for tracking reason
    environmentalData.indoor["dewPoint"] = indoorDewPoint;
    environmentalData.outdoor["dewPoint"] = outdoorDewPoint;

    const delta = indoorDewPoint - outdoorDewPoint;
    console.log(new Date(), "Dew point delta " + delta + " for ", environmentalData);
    const indoor = environmentalData.indoor;
    const outdoor = environmentalData. outdoor;
    if (indoor.humidity < INDOOR_HUMIDITY_MIN) {
        console.log(new Date(), "Switch off because indoor humidity to low", environmentalData);
        return false;
    } else if (indoor.temperature < INDOOR_TEMP_MIN) {
        console.log(new Date(), "Switch off because indoor temperature to low", environmentalData);
        return false;
    } else if(outdoor.temperature < OUTDOOR_TEMP_MIN) {
        console.log(new Date(), "Switch off because outdoor temperature to low", environmentalData);
        return false;
    } else if (delta >= (DEW_POINT_DELTA_MIN + HYSTERESE)) {
        console.log(new Date(), "Switch on");
        return true;
    } else if (delta < DEW_POINT_DELTA_MIN) {
        console.log(new Date(), "Switch off because dew point delta to small");
        return false;
    } else {
        console.log(new Date(), "No switch status change. Keeping switch " + (switchOn ? "on" : "off"));
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

function configureLight(environmentalData) {
    var humidity = environmentalData.indoor.humidity;
    var shellyRgb = null;
    if (humidity < INDOOR_HUMIDITY_MIN) {
        shellyRgb = SHELLY_RGB_COLOR_HUMIDITY_DRY;
    } else if (humidity >= INDOOR_HUMIDITY_MAX) {
        shellyRgb = SHELLY_RGB_COLOR_HUMIDITY_MOISTY;
    } else {
        shellyRgb = SHELLY_RGB_COLOR_HUMIDITY_COMFORT_ZONE;
    }
    console.log(new Date(), "Set light to ", shellyRgb, " because of humidity ", humidity);
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
        Shelly.call("PLUGS_UI.SetConfig", {config: uiConfig}, function(response, error_code, error_message){errorHandler(response, error_code, error_message)})
    })
}

function sendStatusChange(environmentalData, switchStatus) {
    environmentalData["switch"] = (switchStatus ? 1 : 0);
    console.log(new Date(), "Sending status change", environmentalData);

    let postData = {
        url: STATE_CHANGE_EVENT_URL,
        body: environmentalData
    };
    Shelly.call("HTTP.POST", postData, function(response, error_code, error_message){console.log(new Date(), response, error_code, error_message)});
}

function startTimer() {
    Timer.set(UPDATE_INTERVAL_MS, true, udpateSwitch)
}

udpateSwitch();
startTimer();

// script end

module.exports ={calculateDewPoint, caclulateSwitchOn, HYSTERESE, DEW_POINT_DELTA_MIN, INDOOR_TEMP_MIN, OUTDOOR_TEMP_MIN, INDOOR_HUMIDITY_MIN, udpateSwitch} 