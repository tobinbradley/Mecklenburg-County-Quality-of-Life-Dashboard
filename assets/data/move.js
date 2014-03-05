var fs = require('fs'),
_ = require('./underscore-min.js'),
meta = require('./metrics.json'),
outjson = {};



// var is = fs.createReadStream('source_file');
// var os = fs.createWriteStream('destination_file');

//is.pipe(os);

var i = 1;
_.each(meta, function(item) {
        outjson[item.field] =  "m" + i;

        var is = fs.createReadStream('meta/' + item.field + '.md');
        var os = fs.createWriteStream('newmeta/' + "m" + i + ".md");
        is.pipe(os);

        i++;
});

console.log(JSON.stringify(outjson));
