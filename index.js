var gutil = require('gulp-util'),
	path = require('path'),
	through = require('through2'),
    chalk = require('chalk'),
    _ = require('lodash'),
    exec = require('child_process').exec,
    PluginError = gutil.PluginError;

// Check out how phpunit gulp does it: https://github.com/mikeerickson/gulp-phpunit/blob/master/index.js

function lightncandy(opts) {

	opts = _.extend({}, opts || {});

	return through.obj(function(file, enc, callback){

		// Pass file through if:
    // - file has no contents
    // - file is a directory
    if ( file.isNull() || file.isDirectory() ) {
        this.push(file);
        return callback();
    }

    if (['.hbs', '.handlebars', '.tmpl', '.mustache'].indexOf(path.extname(file.path)) === -1) {
        this.emit('error', new PluginError({
            plugin: 'LightnCandy',
            message: 'Supported formats include Handlebars and Mustache templates only.'
        }));
        return callback();
    }

    // No support for streams
    if (file.isStream()) {
        this.emit('error', new PluginError({
            plugin: 'LightnCandy',
            message: 'Streams are not supported.'
        }));
        return callback();
    }

    //./process --template templates/listings/hero/single.hbs --dest template/listings/hero/single.php
    // More compile options https://github.com/zordius/lightncandy
    var template = file.path.substr(file.path.indexOf("templates"));
    var dest = template.replace(path.extname(template), '.php');

    command = 'node_modules/gulp-lightncandy/process ';
    command += '--template ' + template + ' ';
    command += '--dest ' + dest;

    exec(command, function (error, stdout, stderr) {
			if ( stderr ) {
				gutil.log(stderr);
			}

			// Trim trailing cr-lf
			stdout = stdout.trim();
			if ( stdout ) {
				gutil.log(stdout);
			}

			// call user callback if ano error occurs
			if ( error ) {
				  gutil.log(error);
        	return callback(error, file);
			} else {
        	return callback(null, file);
			}

		});

	});

}

module.exports = lightncandy;