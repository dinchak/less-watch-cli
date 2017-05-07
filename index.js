#!/usr/bin/env node

/**
 * less-watch
 *
 * Recompiles CSS files when changes are made to a LESS file or the folder the
 * LESS file exists within.
 * @author Tom Dinchak <dinchak@gmail.com>
 * @license MIT
 */

var fs = require('fs');
var path = require('path');
var Watcher = require('watch-fs').Watcher;
var less = require('less');
var program = require('commander');
var chalk = require('chalk');
var moment = require('moment');
var CleanCSS = require('clean-css');

program
  .version('1.0.0')
  .arguments('<inputfile> <outputfile>')
  .usage('[options] <inputfile> <outputfile>')
  .option('-s, --source-map', 'include inline source map')
  .option('-c, --compile', 'compile on run')
  .option('-m, --minify', 'minify output css')
  .action(run)
  .on('--help', showExamples)
  .parse(process.argv);

if (program.args.length < 2) {
  program.outputHelp();
}

/**
 * Main entry point.  Starts the watcher and runs initial compile.
 * @param {String} inFile The LESS file to watch
 * @param {String} outFile The CSS file to write to
 */
async function run(inFile, outFile) {
  if (!fs.existsSync(inFile)) {
    handleError(
      new Error('input file ' + chalk.cyan(inFile) + ' does not exist')
    );
  }

  try {
    await createWatcher(inFile, outFile);
    showOptions(inFile, outFile);
    log('---');
    log(chalk.bold.white('less-watch started'));
    log('---');
    if (program.compile) {
      await compile(inFile, outFile, '', chalk.bold.green('compile on run'));
    }
  } catch (err) {
    handleError(err);
  }
}

/**
 * Creates a watcher instance that looks for changes in the folder the input
 * file exists in, or any subfolders under it.  Will only trigger on changes
 * to .less files.
 * @param {String} inFile The LESS file to watch
 * @param {String} outFile The CSS file to write to
 */
function createWatcher(inFile, outFile) {
  return new Promise(function (resolve, reject) {
    var watcher = new Watcher({
      paths: [path.dirname(inFile)],
      filters: {
        includeFile: function (file) {
          return /\.less/.test(file);
        }
      }
    });

    watcher.on('create', function (file) {
      compile(inFile, outFile, file, chalk.bold.green('file created'));
    });
    watcher.on('change', function (file) {
      compile(inFile, outFile, file, chalk.bold.yellow('file changed'));
    });
    watcher.on('delete', function (file) {
      compile(inFile, outFile, file, chalk.bold.red('file deleted'));
    });

    watcher.start(function (err, failed) {
      if (err) {
        reject(err);
        return;
      }
      if (failed.length) {
        reject(failed);
        return;
      }
      resolve(watcher);
    });
  });
}

/**
 * Compile the LESS file to CSS.
 * @param {String} inFile The LESS file to watch
 * @param {String} outFile The CSS file to write to
 * @param {String} file The file that was changed
 * @param {String} event The file change event
 */
function compile(inFile, outFile, file, event) {
  var cwd = path.dirname(path.resolve(inFile));
  var relativePath = file.replace(cwd + '/', '');

  var lessOpts = {
    paths: [path.dirname(inFile)],
    filename: path.resolve(inFile)
  };

  if (program.sourceMap) {
    lessOpts.sourceMap = {};
  }

  compileOut(inFile, outFile, relativePath, event);

  return less.render(fs.readFileSync(inFile).toString(), lessOpts)
  .then(function (output) {
    var css = output.css;
    var sourceMap = output.map;

    if (program.minify) {
      if (program.sourceMap) {
        output = new CleanCSS({sourceMap: true}).minify(css, sourceMap);
        sourceMap = output.sourceMap;
      } else {
        output = new CleanCSS().minify(css);
      }
      css = output.styles;
    }

    if (program.sourceMap) {
      css += '\n/*# sourceMappingURL=' + path.basename(outFile) + '.map */'
      fs.writeFileSync(outFile + '.map', sourceMap);
    }

    fs.writeFileSync(outFile, css);
    log('done');
  });
}

/**
 * Log the compilation event.
 * @param {String} inFile The LESS file to watch
 * @param {String} outFile The CSS file to write to
 * @param {String} file The file that was changed
 * @param {String} event The file change event
 */
function compileOut(inFile, outFile, relativePath, event) {
  var out = chalk.cyan(inFile) + ' -> ' + chalk.bold.cyan(outFile);
  if (program.sourceMap) {
    out += ', ' + chalk.bold.cyan(outFile + '.map');
  }
  if (relativePath) {
    event += ': ' + chalk.cyan(relativePath);
  }
  out += ' [' + event + ']';
  log(out);
}

/**
 * Show execution examples.
 */
function showExamples() {
  console.log('  Examples:');
  console.log('');
  console.log('    $ less-watch ./less/index.less ./css/index.css');
  console.log('    $ less-watch -s -c index.less ../css/index.css');
  console.log('');
}

/**
 * Show watcher configuration options at startup.
 * @param {String} inFile The LESS file to watch
 * @param {String} outFile The CSS file to write to
 */
function showOptions(inFile, outFile) {
  log('    input file: ' + chalk.cyan(inFile))
  log('      watching: ' + chalk.cyan(path.dirname(inFile)));
  log('    compile to: ' + chalk.bold.cyan(outFile));
  log('    source map: ' + (
    program.sourceMap ?
    chalk.green('enabled') :
    chalk.red('disabled'))
  );
  log('compile on run: ' + (
    program.compile ?
    chalk.green('enabled') :
    chalk.red('disabled'))
  );
  log('        minify: ' + (
    program.minify ?
    chalk.green('enabled') :
    chalk.red('disabled'))
  );
}

/**
 * Log a string to the console with a timestamp.
 * @param {String} str String to log
 */
function log(str) {
  console.log(timestamp() + ' ' + str);
}

/**
 * Generate a timestamp for log display.
 */
function timestamp() {
  return chalk.magenta(moment().format('h:mm:ssa'));
}

/**
 * Handle a caught error
 * @param {Error} err Error object
 */
function handleError(err) {
  console.log(err.stack);
  process.exit();
}
