#!/usr/bin/env node
var fs = require('fs')
  , async = require('async')
  , scripts = null
  , pkg = null

async.waterfall([
  function pkgExists(cb) {
    fs.exists(process.cwd () + '/package.json', function (exists) {
      if (exists) {
        pkg = require(process.cwd() + '/package.json')
        scripts =  pkg.scripts
        cb(null)
      } else {
        cb('No package.json found in your project')
      }
    })
  },
  function getBinaries(cb) {
    fs.readdir(process.cwd() + '/node_modules/.bin', function (err, files) {
      if (err) {
        cb(err.toString())
      } else if (files.length === 0) {
        cb('Nothing in ./node_modules/.bin')
      } else {
        cb(null, files)
      }
    })
  },
  function useBinaries(bin, cb) {
    Object.keys(scripts).forEach(function (key) {
      scripts[key] = scripts[key].split(' ').map(function (item) {
        if (bin.indexOf(item) > -1) {
          return './node_modules/.bin/' + item
        }
        return item
      }).join(' ')
    })
    cb(null, pkg)
  }], function (err, res) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    fs.writeFile(process.cwd() + '/package.json', JSON.stringify(res, null, 2), {encoding: 'utf8'}, function (err) {
      if (err) throw err
      console.log('./node_modules/.bin paths written to package.json scripts.')
    })
})