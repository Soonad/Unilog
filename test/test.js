const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/server')

const url = ('http://localhost:3000/api')
const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

describe('Unilog Server', () => {

  // =============== length(stream_id) Tests =============== //
  describe('GET get_stream: valid stream_id', () => {
    it('should return stream_id length correctly', (done) => {
      chai.request(url)
        .get('/streams/MQ')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.length >= 0).to.be.true
          done()
        })
    })
  })

  describe('GET get_stream: malformed stream_id', () => {
    it('should return stream_id malformed error message', (done) => {
      chai.request(url)
        .get('/streams/malformed_stream_id')
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("malformed")).to.be.true
          done()
        })
    })
  })

  describe('GET get_stream: big stream_id', () => {
    it('should return stream_id too long error message', (done) => {
      chai.request(url)
        .get('/streams/WW91Q2FtZVRvU2VlV2hhdEl0TWVhbnNSaWdodD9Zb3VBcmVBQ3VyaW91c0ZlbGxvdy4uLg')
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("too")).to.be.true
          done()
        })
    })
  })

  // =============== load(stream_id, from, to) Tests =============== //
  describe('GET get_stream_events: valid inputs', () => {
    it('should return event list of stream_id', (done) => {
      chai.request(url)
        .get('/streams/MQ/events?from=0&to=1')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events.length === 2).to.be.true
          resp.events[0].should.be.an('object')
          resp.events[1].should.be.an('object')
          done()
        })
    })
  })

  describe('GET get_stream_events: from == to', () => {
    it('should return a single event', (done) => {
      chai.request(url)
        .get('/streams/MQ/events?from=0&to=0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events.length === 1).to.be.true
          done()
        })
    })
  })

  describe('GET get_stream_events: from > to', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/MQ/events?from=1&to=0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events).to.be.empty
          done()
        })
    })
  })

  describe('GET get_stream_events: from < 0', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/MQ/events?from=-1&to=0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events).to.be.empty
          done()
        })
    })
  })

  describe('GET get_stream_events: malformed stream_id', () => {
    it('should return malformed message', (done) => {
      chai.request(url)
        .get('/streams/malformed_stream_id/events?from=0&to=1')
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("malformed")).to.be.true
          done()
        })
    })
  })

  describe('GET get_stream_events: stream_id too long', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/WW91Q2FtZVRvU2VlV2hhdEl0TWVhbnNSaWdodD9Zb3VBcmVBQ3VyaW91c0ZlbGxvdy4uLg/events?from=0&to=1')
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("too")).to.be.true
          done()
        })
    })
  })

  // =============== push(stream_id, data) Tests =============== //
  describe('POST push_event: valid stream_id', () => {
    it('should return 200', (done) => {
      chai.request(url)
        .post('/streams/MQ/events')
        .send({
          data: 'WW91SnVzdENhbnRTdGFuZEJlaW5nQ3VyaW91cw'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    })
  })

  describe('POST push_event: malformed stream_id', () => {
    it('should return stream_id malformed error message', (done) => {
      chai.request(url)
        .post('/streams/malformed_stream_id/events')
        .send({
          data: 'WW91SnVzdENhbnRTdGFuZEJlaW5nQ3VyaW91cw'
        })
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.a('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("malformed")).to.be.true
          done()
        })
    })
  })

  describe('POST push_event: big stream_id', () => {
    it('should return stream_id too big error message', (done) => {
      chai.request(url)
        .post('/streams/WW91Q2FtZVRvU2VlV2hhdEl0TWVhbnNSaWdodD9Zb3VBcmVBQ3VyaW91c0ZlbGxvdy4uLg/events')
        .send({
          data: 'WW91SnVzdENhbnRTdGFuZEJlaW5nQ3VyaW91cw'
        })
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.a('object')

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("too")).to.be.true
          done()
        })
    })
  })
})
