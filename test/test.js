const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/server')

const url = ('http://localhost:3000')
const should = chai.should()
chai.use(chaiHttp)

describe('Unilog Server', () => {
  describe('length: GET /streams/:stream_id', () => {
    it('should return stream_id length', (done) => {
      chai.request(url)
        .get('/streams/0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    })
  })

  describe('load: GET /streams/:stream_id/events', () => {
    it('should return event list of stream_id', (done) => {
      chai.request(url)
        .get('/streams/0/events?from=0&to=1')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    })
  })

  describe('POST /streams/:stream_id/events', () => {
    it('should return success', (done) => {
      chai.request(url)
        .post('/streams/0/events')
        .send({
          'data' : 'testData'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    })
  })
})
