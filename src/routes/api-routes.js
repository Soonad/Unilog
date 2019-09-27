// Dummy data - For testing only
var id0 = Buffer.from('0')
var id1 = Buffer.from('1')

var data00 = Buffer.from('TEST_DATA: STREAM 0; EVENT 0')
var data01 = Buffer.from('TEST_DATA: STREAM 0; EVENT 1')
var data10 = Buffer.from('TEST_DATA: STREAM 1; EVENT 0')

var dummy =
{
  stream1:
    {
      id: id0.toString('base64'),
      length: 2,
      events: [
        { index: 0, data: data00.toString('base64') },
        { index: 1, data: data01.toString('base64') }
      ]
    },

  stream2:
    {
      id: id1.toString('base64'),
      length: 1,
      events: [
        { index: 0, data: data10.toString('base64') }
      ]
    }
}

async function routes (fastify, options) {
  // push
  fastify.post('/streams/:stream_id/events', async (req, res) => {
    return { hello: 'push' }
  })

  // length
  fastify.get('/streams/:stream_id/events', async (req, res) => {
    return { hello: 'length' }
  })

  // load
  fastify.get('/streams/:stream_id', async (req, res) => {
    return { hello: 'load' }
  })
}

module.exports = routes
