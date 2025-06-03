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
                cb({"output": true});
                break;
            case 'switch.set':
                break;
            case 'http.get':
                cb({"body" : JSON.stringify({
                    "indoor": {"temperature" : 20, "humidity" : 100},
                    "outdoor": {"temperature" : 20, "humidity" : 100}
                })});
                break;
            default:
                break;
        }
    }
}

module.exports = {Timer, Shelly}