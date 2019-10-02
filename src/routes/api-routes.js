const utils = require('../utils/utils')
const isSizeValid = utils.isSizeValid
const isBase64 = utils.isBase64

const in_memory = require('../event_storage/in-memory')
const dummy = in_memory.dummy
const length = in_memory.length
const load = in_memory.load
const push = in_memory.push

const api_base_url = '/api';

// max size in bytes
const stream_id_max_size = 16
const data_max_size = 128

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

    res
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(resp)
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

    res
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(resp)
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
    .header('Content-Type', 'application/json; charset=utf-8')
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
