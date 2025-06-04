Timer = {
    set: function(interval, repeat, cb) {
        console.log("Set timer to " + interval + " with " + repeat + " executing callback once");
        cb();
    }
}

Shelly = {
    call: function(id, options, cb) {
        console.log("Shelly.call for " + id + " with options ", options);
        switch (id) {
            case 'switch.getStatus':
                cb({"output": true},0);
                break;
            case 'switch.set':
                cb(null,0);
                break;
            case 'http.get':
                cb({"body" : JSON.stringify({
                    "indoor": {"temperature" : 20, "humidity" : 100},
                    "outdoor": {"temperature" : 20, "humidity" : 100}
                })},0);
                break;
            case 'PLUGS_UI.GetConfig':
                cb({"leds":{"mode":"switch","colors":{"switch:0":{"on":{"rgb":[100,100,0],"brightness":100},"off":{"rgb":[100,100,100],"brightness":100}},"power":{"brightness":100}},"night_mode":{"enable":true,"brightness":10,"active_between":["22:00","06:00"]}},"controls":{"switch:0":{"in_mode":"detached"}}} ,0)
                break;
            default:
                cb(null, 0)
                break;
        }
    }
}

module.exports = {Timer, Shelly}