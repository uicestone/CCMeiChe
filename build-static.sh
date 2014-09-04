cd public
gulp tpl2mod
cortex build
cortex bundle -d dest
gulp stylus
gulp uglify