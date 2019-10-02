const api_base_url = '/api';

// Dummy data - For testing only
// TODO: Use a proper database (Postgre) instead of hardcoded JSON

// max size in bytes
const stream_id_max_size = 16
const data_max_size = 128

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

// Checks if base64 string is well formed
function isBase64(base64_str) {
    if (base64_str === '' || base64_str.trim() === ''){ return false; }
    try {
      const str_decode = Buffer.from(base64_str, 'base64').toString('ascii')
      const str_reencode = Buffer.from(str_decode).toString('base64').replace(/=/g, '')
      return str_reencode == base64_str
    } catch (err) {
        return false;
    }
}

// checks if input size is valid
function isSizeValid(base64_str, max_size) {
  return Buffer.from(base64_str, 'base64').toString('ascii').length <= max_size
}

// =============== Route URLs =============== //
const get_stream_url = api_base_url + '/streams/:stream_id'
const get_stream_events_url = api_base_url + '/streams/:stream_id/events*'
const push_event_url = api_base_url + '/streams/:stream_id/events'

// =============== Route Schemas =============== //
const get_stream_schema =
{
  response: {
    // Correct ID formatting
    200: {
      type: 'object',
      properties: {
        stream_id: { type: 'string' },
        length: { type: 'integer' },
      },
    },
    // Validation errors
    400: {
      type: 'object',
      properties: {
          error: { type: 'string' },
      }
    }
  }
}

const get_stream_events_schema =
{
  response: {
    200: {
      type: 'object',
      properties: {
        stream_id: { type: 'string' },
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

    400: {
      type: 'object',
      properties: {
        error: {type: 'string'}
      },
    },
  },
}

const push_event_schema =
{
  response: {
    200: {
      type: 'object',
    },
    400: {
      type: 'object',
      properties: {
        error: {type: 'string'},
      },
    },
  },
}

// =============== Route Handlers =============== //
async function get_stream_handler (req, res) {
  const stream_id = req.params.stream_id
  var msg = ""

  if (!isBase64(stream_id)) {
    msg = "stream_id is malformed"
  }
  else if (!isSizeValid(stream_id, stream_id_max_size)){
    msg = "stream_id is too big"
  }
  else {
    const len = await length(stream_id)

    const resp =
    {
      stream_id: stream_id,
      length: len,
    }

    return JSON.stringify(resp)
  }

  res
  .code(400)
  .header('Content-Type', 'application/json; charset=utf-8')
  .send({ error: msg })
}

async function get_stream_events_handler (req, res) {
  const stream_id = req.params.stream_id
  const from = req.query.from
  const to = req.query.to

  if (!isBase64(stream_id)) {
    msg = "stream_id is malformed"
  }
  else if (!isSizeValid(stream_id, stream_id_max_size)){
    msg = "stream_id is too big"
  }
  else {
    const events_array = await load(stream_id, from, to)

    const resp = {
      stream_id: stream_id,
      events: events_array,
    }

    return JSON.stringify(resp)
  }

  res
  .code(400)
  .header('Content-Type', 'application/json; charset=utf-8')
  .send({ error: msg })
}

async function push_event_handler (req, res) {
  const stream_id = req.params.stream_id
  const data = req.body.data

  var is_successful = false
  var msg = ""

  // verify inputs
  var stream_id_size_valid = isSizeValid(stream_id, stream_id_max_size)
  var data_size_valid = isSizeValid(data, data_max_size)

  var stream_id_encoding_valid = isBase64(stream_id)
  var data_encoding_valid = isBase64(data)

  if (!stream_id_size_valid || !data_size_valid) {
    msg = (data_size_valid ? "stream_id" : "data") + " is too long"
  }
  else if (!stream_id_encoding_valid || !data_encoding_valid) {
    msg = (data_encoding_valid ? "stream_id" : "data") + " is malformed"
  }
  else {
    is_successful = await push(stream_id, data)
    msg = ""
  }

  if (is_successful) {
    res
    .code(200)
    .send({})
  }
  else {
    res
    .code(400)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ error: msg })
  }
}

// =============== Routes =============== //
const routes = [
  // get_stream
  {
    method: 'GET',
    url: get_stream_url,
    schema: get_stream_schema,
    handler: get_stream_handler
  },

  // get_stream_events
  {
    method: 'GET',
    url: get_stream_events_url,
    schema: get_stream_events_schema,
    handler: get_stream_events_handler
  },

  // push_event
  {
    method: 'POST',
    url: push_event_url,
    schema: push_event_schema,
    handler: push_event_handler
  }
]

module.exports = routes
