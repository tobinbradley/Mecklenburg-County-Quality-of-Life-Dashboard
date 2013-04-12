# Generate Random Number for Cache Busting
$rand = Get-Random

# Minify CSS and JavaScript
java -jar ../yuicompressor-2.4.7.jar --type css -o public/css/main.css public/css/main.css
java -jar ../yuicompressor-2.4.7.jar --type js -o public/js/main.js public/js/main.js

# Bust cache for anything with foo argument
(Get-Content public/index.html) | ForEach-Object { $_ -replace "^?foo=[0-9]*", "foo=$rand" } | Set-Content public/index.html
