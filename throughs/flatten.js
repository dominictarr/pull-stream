'use strict'

var values = require('../sources/values')
var once = require('../sources/once')

function getAbortCb(read, abort, cb) {
  return function(err) {
    read(err || abort, cb)
  }
}
function getChunkErrorCb(err, cb) {
  return function() {
    cb(err)
  }
}

//convert a stream of arrays or streams into just a stream.
module.exports = function flatten () {
  return function (read) {
    var _read
    return function (abort, cb) {
      if (abort) { //abort the current stream, and then stream of streams.
        _read ? _read(abort, getAbortCb(read, abort, cb)) : read(abort, cb)
      }
      else if(_read) nextChunk()
      else nextStream()

      function nextChunk () {
        _read(null, function (err, data) {
          if (err) {
            if (err === true) nextStream()
            else read(true, getChunkErrorCb(err, cb))
          }
          else cb(null, data)
        })
      }
      function nextStream () {
        _read = null
        read(null, function (end, stream) {
          if(end)
            return cb(end)
          if(stream && 'object' === typeof stream)
            stream = values(stream)
          else if ('function' !== typeof stream)
            stream = once(stream)
          _read = stream
          nextChunk()
        })
      }
    }
  }
}

