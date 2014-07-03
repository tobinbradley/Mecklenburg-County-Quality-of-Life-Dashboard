var gulp = require('gulp'),
    jsoncombine = require("gulp-jsoncombine");

gulp.src("public/data/metric/*.json")
    .pipe(jsoncombine("merge.json", function(data){ return new Buffer(JSON.stringify(data)); }))
    .pipe(gulp.dest("public/data"));

// var data = {},
//     dir = "public/data/metric/",
//     outputFilename = dir + "bucket.json";
//
// fs.readdir(dir, function(err, files){
//     if (err) throw err;
//     var c=0;
//     files.forEach(function(file){
//         c++;
//         fs.readFile(dir + file, 'utf-8', function(err, html){
//             if (err) throw err;
//             data[path.basename(file, '.json')]=html;
//             if (0===--c) {
//                 //console.log(data);  //socket.emit('init', {data: data});
//                 fs.writeFile(outputFilename, JSON.stringify(data), function(err) {
//                     if(err) {
//                       console.log(err);
//                     } else {
//                       console.log("JSON saved to " + outputFilename);
//                     }
//                 });
//             }
//         });
//     });
// });
