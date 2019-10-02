// Dummy data - For testing only
// TODO: Use a proper database (Postgre) instead of hardcoded JSON

var id0 = Buffer.from('0')
var id1 = Buffer.from('1')

var data00 = Buffer.from('TEST_DATA: STREAM 0; EVENT 0')
var data01 = Buffer.from('TEST_DATA: STREAM 0; EVENT 1')
var data10 = Buffer.from('TEST_DATA: STREAM 1; EVENT 0')

var dummy =
{
  MQ: {
    length: 2,
    events:
      [
        { index: 0, data: data00.toString('base64') },
        { index: 1, data: data01.toString('base64') }
      ]
  },

  Mg: {
    length: 1,
    events:
      [
        { index: 0, data: data10.toString('base64') }
      ]
  }
}

// Data access functions
// TODO: transfer these functions to a separate file

// function length
// description: Returns length property of a given stream
// inputs: stream_id:Int
// returns: Int
async function length (stream_id) {
  var len = 0
  if (dummy[stream_id] !== undefined) {
    len = dummy[stream_id].length
  }
  return len
}

// function load
// description: Returns an interval of events in a given stream
// inputs: stream_id:Int, from:Int, to:Int
// returns: [Object]
async function load (stream_id, from, to) {
  var result = []
  if (dummy[stream_id] !== undefined) {
    var events = dummy[stream_id].events
    if (from >= 0 && to >= from && from < events.length && to < events.length) {
      result = events.slice(from, to+1)
    }
  }
  return result
}

// function push
// description: Include an event in a given stream
// inputs: stream_id:Int, data:String
// returns: Object -- success/failure indicator
async function push (stream_id, data) {
  var success = false
  const base64_data = data.toString('base64')
  if (dummy[stream_id] === undefined) {
    dummy[stream_id] = {
      length: 1,
      events:
        [{ index: 0, data: base64_data }]
    }
  } else {
    var len = dummy[stream_id].length
    dummy[stream_id].events[len] = { index: len, data: base64_data }
    dummy[stream_id].length += 1
    success = true
  }
  return success
}


module.exports = {
  dummy: dummy,
  length: length,
  load: load,
  push: push,
}
