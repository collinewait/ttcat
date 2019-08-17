# ttcat

A command line Twitter client

[![Build Status](https://travis-ci.org/collinewait/ttcat.svg?branch=master)](https://travis-ci.org/collinewait/ttcat)

I created this app while taking a pluralsight course "Building Command Line Applications in Node.js".

You can install the latest version by running npm install @collinewait/ttcat.

To use the ttcat CLI:

- Login and create an application on [developer.twitter.com/apps](https://developer.twitter.com/apps)
- Run `ttcat configure consumer` and enter your application's consumer key and secret
- Run `ttcat configure account` and follow the instructions
- Run `ttcat lookup users [screen_name]` to try looking up a Twitter user. `screen_name` being the user's twitter handle. e.g `collinewait` without the `@` symbol. You can pass in comma separated names.
- Run `ttcat lookup statuses [id]` to try looking up a Twitter user status. `id` being the status id. e. `01347242386434867`. You can pass in comma separated IDs.

Credit: Paul O'Fallon who authored "Building Command Line Applications in Node.js" pluralsight course.
