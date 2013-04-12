#! /bin/bash

# Generate Random Number for Cache Busting
rand=$RANDOM

# Minify CSS and JavaScript
yui-compressor --type css -o public/css/main.css public/css/main.css
yui-compressor --type js -o public/js/main.js public/js/main.js

# Bust cache for anything with foo argument
sed -i "s/?foo=[0-9]*/?foo=$rand/g" public/index.html

# Optimize Images
trimage -q -d public/images
