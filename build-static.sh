cd public
gulp tpl2mod
cortex build
rm -rf dest
mkdir -p bundle
cortex bundle -d bundle --no-neuron
gulp stylus
gulp uglify
rm -rf bundle