#!/bin/bash
BUILD_DIR=../circuits/wise/build
CIRCUIT_NAME=wise_send
CIRCUIT_DIR=wise
source circuit.env

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
start=$(date +%s)
set -x
node --max_old_space_size=644000 ../circuits/$CIRCUIT_DIR/node_modules/.bin/snarkjs groth16 prove "$BUILD_DIR"/"$CIRCUIT_NAME".zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo

# echo "****VERIFYING PROOF FOR SAMPLE INPUT****"
# start=$(date +%s)
# set -x
# node --max_old_space_size=16384 --huge-max-old-generation-size ../circuits/$CIRCUIT_DIR/node_modules/.bin/snarkjs groth16 verify "$BUILD_DIR"/wise_send_vkey.json "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json
# end=$(date +%s)
# { set +x; } 2>/dev/null
# echo "DONE ($((end - start))s)"
# echo
