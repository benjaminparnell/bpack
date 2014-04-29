#!/usr/bin/env node

var fs = require('fs')
  , _ = require('underscore')
  , async = require('async')
  , scripts = null
  , pkg = null

async.waterfall([
  function pkgExists(callback) {
    fs.exists(process.cwd () + '/package.json', function (exists) {
      if (exists) {
        pkg = require(process.cwd() + '/package.json')
        scripts =  pkg.scripts
        callback(null)
      } else {
        console.log('No package.json found in your project')
        process.exit(1)
      }
    })
  },
  function getBinaries(callback) {
    fs.readdir(process.cwd() + '/node_modules/.bin', function (err, files) {
      if (err) {
        console.log(err.toString())
        process.exit(1)
      } else {
        callback(null, files)
      }
    })
  },
  function useBinaries(bin, cb) {
    _(Object.keys(scripts)).each(function (key) {
      var value = _.map(scripts[key].split(' '), function (item) {
        if (_.contains(bin, item)) {
          return './node_modules/.bin/' + item
        }
        return item
      })
      scripts[key] = value.join(' ')
    })
    cb(null, pkg)
  }
  ], function (err, res) {
    fs.writeFile(process.cwd() + '/package.json', JSON.stringify(res, null, 2), {encoding: 'utf8'}, function (err) {
      if (err) throw err
      console.log('./node_modules/.bin paths written to package.json scripts.')
    })
})