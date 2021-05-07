'use strict'

var tester = require('../util/tester')

module.exports = function filter (test) {
  //regexp
  test = tester(test)
  return function (read) {
    return function next (end, cb) {
      var sync, loop = true
      while(loop) {
        loop = false
        sync = true
        read(end, function (end, data) {
          try {
            if(!end && !test(data)) {
              return sync ? loop = true : next(end, cb)
            }
          } catch (err) {
            end = err
          }

          cb(end, data)
        })
        sync = false
      }
    }
  }
}

