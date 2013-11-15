var     start = new Date().getTime(),
        _ = require('./underscore-min.js'),
        meta = require('./metrics.json'),
        toMarkdown = require('./to-markdown.js').toMarkdown,
        out = "",
        fs = require('fs');

_.each(meta, function(item, i) {
        out = "## " + item.title + "\n";
        out += item.description + "\n\n";
        out += "### Why is this important?\n";
        out += item.importance + "\n\n";
        out += "### About the Data\n";
        out += item.tech_notes + "\n\n";
        out += "_Source: " + item.source + "_\n\n";
        out += "### Additional Resources\n";
        _.each(item.links.split("<br>"), function(item){
            out += "+ " + toMarkdown(item) + "\n";
        });
        fs.writeFile("./meta/" + item.field + ".md", out, function(err) {
            if(err) {
                console.log(err);
            }
        });
});

console.log("done in " + Math.abs(start - new Date().getTime()) / 1000 + " seconds");
