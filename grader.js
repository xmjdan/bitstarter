#!/usr/bin/env node
/*
   Automatically grade files for the presence of specified HTML tags/attributes.
   Uses commander.js and cheerio. Teaches command line application development
   and basic DOM parsing.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://whispering-dawn-9127.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code

    }
    return instr;

};

var assertURLExists = function(url) {
    return url;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));

};

var cheerioURL = function(checksfile) {
    var getHtml = function(result, response) {
        console.log("!!!!!!!"+result);
        var out = {
        };
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
            process.exit(1);
        } else {
            console.error("GetHtmlContent Successful!");
            $ = cheerio.load(result);
            var checks = loadChecks(checksfile).sort();
            for(var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
            }
        }
        return out;
    };
    return getHtml;
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {
    };
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(url, checksfile) {
    var getHtml = cheerioURL(checksfile);
    return rest.get(url).on('complete', getHtml);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({
    });

};

if(require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', assertFileExists)
    .option('-u, --url <url>', 'URL', assertURLExists)
    .parse(process.argv);
    //console.log(program.file);
    //console.log(program.url);
    var checkJson = {
    };
    if (program.file && program.url) {
        process.exit(1);
    } else if (program.file) {
        checkJson = checkHtmlFile(program.file, program.checks);
    } else if (program.url) {
        checkJson = checkURL(program.url, program.checks);
    }
    //console.log(checkJson);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);

} else {
    exports.checkHtmlFile = checkHtmlFile;

}
