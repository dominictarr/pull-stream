var test = require('tape')
var pull = require('../')
var type = require('../type')

test('util - type', function (t) {
  t.plan(4)

  t.is(type(pull.values()), 'source', 'type of pull.values()')
  t.is(type(pull.once()), 'source', 'type of pull.once()')
  // t.is(type(pull.map()), 'through', 'type of pull.map()')
  // t.is(type(pull.take()), 'through', 'type of pull.take()')
  t.is(type(pull.reduce()), 'sink', 'type of pull.reduce()')
  t.is(type(pull.log()), 'sink', 'type of pull.log()')
})
