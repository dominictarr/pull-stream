'use strict'

function id (item) { return item }

function prop (key) {
  return (
    'string' == typeof key
    ? function (data) { return data[key] }
    : key && 'object' === typeof key && 'function' === typeof key.exec //regexp
    ? function (data) { var v = map.exec(data); return v && v[0] }
    : key || id
  )
}


var drain = exports.drain = function (op, done) {
  var read, abort

  function sink (_read) {
    read = _read
    if(abort) return sink.abort()
    //this function is much simpler to write if you
    //just use recursion, but by using a while loop
    //we do not blow the stack if the stream happens to be sync.
    ;(function next() {
        var loop = true, cbed = false
        while(loop) {
          cbed = false
          read(null, function (end, data) {
            cbed = true
            if(end = end || abort) {
              loop = false
              if(done) done(end === true ? null : end)
              else if(end && end !== true)
                throw end
            }
            else if(op && false === op(data) || abort) {
              loop = false
              read(abort || true, done || function () {})
            }
            else if(!loop){
              next()
            }
          })
          if(!cbed) {
            loop = false
            return
          }
        }
      })()
  }

  sink.abort = function (err, cb) {
    if('function' == typeof err)
      cb = err, err = true
    abort = err || true
    if(read) return read(abort, cb || function () {})
  }

  return sink
}

var onEnd = exports.onEnd = function (done) {
  return drain(null, done)
}

var log = exports.log = function (done) {
  return drain(function (data) {
    console.log(data)
  }, done)
}

var find =
exports.find = function (test, cb) {
  var ended = false
  if(!cb)
    cb = test, test = id
  else
    test = prop(test) || id

  return drain(function (data) {
    if(test(data)) {
      ended = true
      cb(null, data)
    return false
    }
  }, function (err) {
    if(ended) return //already called back
    cb(err === true ? null : err, null)
  })
}

var reduce = exports.reduce = function (reduce, acc, cb) {

  return drain(function (data) {
    acc = reduce(acc, data)
  }, function (err) {
    cb(err, acc)
  })

}

var collect = exports.collect =
function (cb) {
  return reduce(function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}

var concat = exports.concat =
function (cb) {
  return reduce(function (a, b) {
    return a + b
  }, '', cb)
}





