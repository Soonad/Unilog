// Dummy data - For testing only
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
        {'index': 1, 'data': data01.toString('base64')}
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
function length(stream_id) {
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
function load(stream_id, from, to) {
  return [{}]
}


// function push
// description: Include an event in a given stream
// inputs: stream_id:int
// returns: nothing
function push(stream_id) {

}

// Routes
async function routes (fastify, options) {
  // length
  fastify.get('/streams/:stream_id', async (req, res) => {
    var id = req.params.stream_id
    const result = await length(0);
    if (result === -1) {
      throw new Error('stream_id not found')
    }
    return JSON.stringify(result)
  })

  // load
  fastify.get('/streams/:stream_id/events?from=:from&to=:to', async (req, res) => {
    return { hello: 'load' }
  })

  // push
  fastify.post('/streams/:stream_id/events', async (req, res) => {
    res.send({ hello: 'push' })
  })
}

module.exports = routes
