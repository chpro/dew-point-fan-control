#!/bin/bash
mkdir -p scripts
cd scripts

sed -n '/script start/,/script end/p' ../app/dewpointcontrol.js > script.js

export SHELLY=plug-02
export SCRIPT_ID=1
export SCRIPT_FILE=script.js

if [ ! -f "put_script.py" ]; then
    wget https://raw.githubusercontent.com/ALLTERCO/shelly-script-examples/refs/heads/main/tools/put_script.py
fi

if [ ! -f "upload-script.sh" ]; then
    wget https://raw.githubusercontent.com/ALLTERCO/shelly-script-examples/refs/heads/main/tools/upload-script.sh
    chmod u+x upload-script.sh
fi

./upload-script.sh -h

cd ..
