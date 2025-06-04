const assertlib = require('assert');
const dptest = require("./dewpointcalculation");
const sotest = require("./switchoncalculation");
const calc = require("../app/dewpointcontrol")

dptest.executeTest();
sotest.executeTest();
calc.udpateSwitch();