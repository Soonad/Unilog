// Dummy data - For testing only
// TODO: Use a proper database (Postgre) instead of hardcoded JSON
var id0 = Buffer.from('0')
var id1 = Buffer.from('1')

var data00 = Buffer.from('TEST_DATA: STREAM 0; EVENT 0')
var data01 = Buffer.from('TEST_DATA: STREAM 0; EVENT 1')
var data10 = Buffer.from('TEST_DATA: STREAM 1; EVENT 0')

var dummy =
[
  {
    'name' : 'stream1',
    'length': 2,
    'id': '0'/*id0.toString('base64')*/,
    'events':
      [
        {'index': 0, 'data': data00.toString('base64')},
        {'index': 1, 'data': data01.toString('base64')},
      ]
  },

  {
    'name' : 'stream2',
    'length': 1,
    'id': '1'/*id1.toString('base64')*/,
    'events':
      [
        {'index': 0, 'data': data10.toString('base64')},
      ]
  },
]

// Data access fucntions
// TODO: transfer these functions to a separate file

// function length
// description: Returns length property of a given stream
// inputs: stream_id:Int
// returns: Int
async function length(stream_id) {
  var len = -1
  if (stream_id < dummy.length && stream_id >= 0) {
    len = dummy[stream_id].length
  }
  return len
}

// function load
// description: Returns an interval of events in a given stream
// inputs: stream_id:Int, from:Int, to:Int
// returns: [Object]
async function load(stream_id, from, to) {
  var result = []
  if (stream_id < dummy.length && stream_id >= 0) {
    var events = dummy[stream_id].events;
    if (events.length > from && events.length <= to) {
      result = events.slice(from, to)
    }
  }
  return result
}


// function push
// description: Include an event in a given stream
// inputs: stream_id:Int, data:String
// returns: Object -- success/failure indicator
async function push(stream_id, data) {
  var result = {success: 'false'}
  if (stream_id < dummy.length && stream_id >= 0) {
    var len = dummy[stream_id].length
    dummy[stream_id].events[len] = {'index': len, 'data': data}
    dummy[stream_id].length += 1;
    result.success = 'true'
  }
  return result
}

// Routes
async function routes (fastify, options) {
  // length
  fastify.get('/streams/:stream_id', async (req, res) => {
    var stream_id = req.params.stream_id
    const result = await length(stream_id);
    if (result === -1) {
      throw new Error('stream_id not found')
    }
    return JSON.stringify(result)
  })

  // load
  fastify.get('/streams/:stream_id/events/:from/:to', async (req, res) => {
    var stream_id = req.params.stream_id
    var from      = req.params.from
    var to        = req.params.to

    const result  = await load(stream_id, from, to);
    return JSON.stringify(result);
  })

  // push
  fastify.post('/streams/:stream_id/events', async (req, res) => {
    var stream_id = req.params.stream_id
    var data = req.body.data

    var result = push(stream_id, data)
    return JSON.stringify({})
  })
}

module.exports = routes
