#!/usr/bin/env bash

set +e +x
set -o pipefail

mkdir -p scripts
cd scripts

sed -n '/script start/,/script end/p' ../app/dewpointcontrol.js > script.js

if [ ! -f "put_script.py" ]; then
    wget https://raw.githubusercontent.com/ALLTERCO/shelly-script-examples/refs/heads/main/tools/put_script.py
    chmod u+x put_script.py
fi

./put_script.py cellar-ventilation.localdomain 1 script.js

cd ..
