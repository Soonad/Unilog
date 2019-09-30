// API information
const api_title = 'Unilog API'
const api_description = 'Simple event log server'
const api_version = '0.0.1'
const api_host = 'localhost'

// Swagger Options
exports.options = {
  routePrefix: '/docs',
  exposeRoute: true,
  swagger: {
    info: {
      title: api_title,
      description: api_description,
      version: api_version
    },
    host: api_host,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
}
