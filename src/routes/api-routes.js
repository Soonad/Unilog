const api_base_url = '/api';

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
    name: 'stream1',
    length: 2,
    id: '0'/* id0.toString('base64') */,
    events:
      [
        { index: 0, data: data00.toString('base64') },
        { index: 1, data: data01.toString('base64') }
      ]
  },

  {
    name: 'stream2',
    length: 1,
    id: '1'/* id1.toString('base64') */,
    events:
      [
        { index: 0, data: data10.toString('base64') }
      ]
  }
]

// Data access functions
// TODO: transfer these functions to a separate file

// function length
// description: Returns length property of a given stream
// inputs: stream_id:Int
// returns: Int
async function length (stream_id) {
  var len = null
  if (stream_id < dummy.length && stream_id >= 0) {
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
  if (stream_id < dummy.length && stream_id >= 0) {
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
  if (stream_id < dummy.length && stream_id >= 0) {
    var len = dummy[stream_id].length
    dummy[stream_id].events[len] = { index: len, data: data }
    dummy[stream_id].length += 1
    success = true
  }
  return success
}

// =============== Route URLs =============== //
const length_url = api_base_url + '/streams/:stream_id'
const load_url = api_base_url + '/streams/:stream_id/events/:from/:to'
const push_url = api_base_url + '/streams/:stream_id/events'

// =============== Route Schemas =============== //
const length_schema =
{
  response: {
    200: {
      type: 'object',
      properties: {
        stream: { type: 'string' },
        length: { type: 'integer' },
        msg:  { type: 'string' },
      },
    }
  }
}

const load_schema =
{
  response: {
    200: {
      type: 'object',
      properties: {
        stream: { type: 'string' },
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: {type: 'integer'},
              data: {type: 'string'},
            },
          },
        },
      },
    },
  },
}

const push_schema =
{
  response: {
    200: {
      type: 'object',
      properties: {
        success: {type: 'boolean'},
        msg: {type: 'string'},
      },
    },
    201: {
      type: 'object',
      properties: {
        success: {type: 'boolean'},
        msg: {type: 'string'},
      },
    },
  },
}

// =============== Route Handlers =============== //
async function length_handler (req, res) {
  const stream_id = req.params.stream_id
  const len = await length(stream_id)
  const error_msg = (len === null) ? 'stream_id not found' : '';

  const resp =
  {
    stream: stream_id,
    length: len,
    msg : error_msg,
  }

  return JSON.stringify(resp)
}

async function load_handler (req, res) {
  const stream_id = req.params.stream_id
  const from = req.params.from
  const to = req.params.to

  const events_array = await load(stream_id, from, to)

  const resp = {
    stream: stream_id,
    events: events_array,
  }

  return JSON.stringify(resp)
}

async function push_handler (req, res) {
  const stream_id = req.params.stream_id
  const data = req.body.data
  const is_successful = await push(stream_id, data)
  var msg = "OK"
  if (!is_successful) {
    res.code(201)
    msg = `An error occured when trying to push data to stream ${stream_id}`
  }

  const resp = {
    success: is_successful,
    msg: msg
  }

  return resp
}

// =============== Routes =============== //
const routes = [
  // length
  {
    method: 'GET',
    url: length_url,
    schema: length_schema,
    handler: length_handler
  },

  // load
  {
    method: 'GET',
    url: load_url,
    schema: load_schema,
    handler: load_handler
  },

  // push
  {
    method: 'POST',
    url: push_url,
    schema: push_schema,
    handler: push_handler
  }
]

module.exports = routes
