less-watch
==========

less-watch is a command line utility automatically recompile LESS files to CSS when a change is detected.  less-watch will also watch the folder and subfolders the monitored file exists in for changes.  It works nicely with something like Bootstrap.

# Installation

```
$ npm install -g less-watch
```

# Basic Usage

```
$ less-watch index.less index.css
```

# Options

```
-s, --source-map  include inline source map
-c, --compile     compile on run
-m, --minify      minify output css
```

# More Examples

```
# watch for changes in the bootstrap/less folder, recompile bootstrap.less when
# a file is created, deleted, or changed.  create a bootstrap.css.map sourcemap
# and compile immediately when the command is run
$ less-watch -s -c bootstrap/less/bootstrap.less css/bootstrap.css

# same as above but also minify
$ less-watch -s -c -m bootstrap/less/bootstrap.less css/bootstrap.min.css