const calc = require("../app/dewpointcontrol")
const assertlib = require('assert');

function executeTest() {
    test(0, false);
    test(calc.DEW_POINT_DELTA_MIN, false);
    test(calc.DEW_POINT_DELTA_MIN - 1, false);

    test(calc.DEW_POINT_DELTA_MIN + calc.HYSTERESE, true);

    // default behavior dependen on switch status
    test(calc.DEW_POINT_DELTA_MIN + 1, null); // case where now sitch status was passed
    test(calc.DEW_POINT_DELTA_MIN + 1, false, false);
    test(calc.DEW_POINT_DELTA_MIN + 1, true, true);
    test(calc.DEW_POINT_DELTA_MIN + calc.HYSTERESE -1, false, false);
    test(calc.DEW_POINT_DELTA_MIN + calc.HYSTERESE -1, true, true);

    test(calc.DEW_POINT_DELTA_MIN + calc.HYSTERESE +1, true);

    testTempLimit(calc.MIN_INDOOR_TEMP -1, 20, false);
    testTempLimit(20, calc.MIN_OUTDOOR_TEMP -1, false);
}

function test(delta, expected, switchOn = null) {
    var indoor = {"temperature" : 20 + delta, "humidity" : 100}; //add 0.1 °C to avoid rounding problems
    var outdoor = {"temperature" : 20, "humidity" : 100};
    var on = calc.caclulateSwitchOn(indoor, outdoor, switchOn);
    assertlib.equal(on, expected);
}

function testTempLimit(indoorTemp, outdoorTemp, expected) {
    var indoor = {"temperature" : indoorTemp, "humidity" : 100}; //add 0.1 °C to avoid rounding problems
    var outdoor = {"temperature" : outdoorTemp, "humidity" : 100};
    var on = calc.caclulateSwitchOn(indoor, outdoor, null);
    assertlib.equal(on, expected);
}

module.exports = {executeTest}