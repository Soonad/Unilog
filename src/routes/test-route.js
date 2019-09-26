async function routes (fastify, options) {
  fastify.get('/', async (req, res) => {
    return { hello: 'world' }
  });

  fastify.get('/other_route', async (req, res) => {
    return { hello: 'kitty' }
  });
}

module.exports = routes;
