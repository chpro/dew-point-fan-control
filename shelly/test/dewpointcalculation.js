const calc = require("../app/dewpointcontrol")
const assertlib = require('assert');

function executeTest() {
    testDewPoint(-5,50,-13.8);
    testDewPoint(-5,75,-8.7);
    testDewPoint(-5,95,-5.7);

    testDewPoint(0,50,-9.2);
    testDewPoint(0,75,-3.9);
    testDewPoint(0,95,-0.7);

    testDewPoint(5,50,-4.6);
    testDewPoint(5,75,0.9);
    testDewPoint(5,95,4.3);

    testDewPoint(40,50,27.6);
    testDewPoint(40,75,34.7);
    testDewPoint(40,95,39.0);

}

function testDewPoint(temperature, humidity, expectedDewPoint) {
    var dewPoint = calc.calculateDewPoint(temperature, humidity);
    console.log(`Dew point calculated ${dewPoint} expected ${expectedDewPoint} for ${temperature} °C and ${humidity}`)
    assertlib.equal(dewPoint.toFixed(1), expectedDewPoint, `Dew point calculated ${dewPoint} expected ${expectedDewPoint} for ${temperature} °C and ${humidity}`)
}

module.exports = {executeTest}