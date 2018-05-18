# This is a fork 🍴

You're looking at a fork the main things that have changed are:

- Added error reporting to the output, the main version at the time of split didn't show any information about syntax errors


less-watch-cli
==============

less-watch-cli is a command line utility automatically recompile LESS files to CSS when a change is detected.  less-watch-cli will also watch the folder and subfolders the monitored file exists in for changes.  It works nicely with something like Bootstrap.

# Installation

```
$ npm install -g less-watch-cli
```

# Basic Usage

```
$ less-watch index.less index.css
```

# Options

```
-s, --source-map  generate source map
-c, --compile     compile on run
-m, --minify      minify output css
```

# Examples

Watch for changes in the bootstrap/less folder, recompile bootstrap.less when a file is created, deleted, or changed.  create a bootstrap.css.map sourcemap and compile immediately when the command is run:
```
$ less-watch -s -c bootstrap/less/bootstrap.less css/bootstrap.css
```

Same as above but also minify:
```
$ less-watch -scm bootstrap/less/bootstrap.less css/bootstrap.min.css
``
