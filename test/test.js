const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/server')

const url = ('http://localhost:3000/api')
const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

describe('Unilog Server', () => {

  // =============== length(stream_id) Tests =============== //
  describe('GET length: valid stream_id', () => {
    it('should return stream_id length correctly', (done) => {
      chai.request(url)
        .get('/streams/0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.length >= 0).to.be.true
          resp.msg.should.be.empty
          done()
        })
    })
  })

  describe('GET length: invalid stream_id', () => {
    it('should return null with error message', (done) => {
      chai.request(url)
        .get('/streams/-1')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.length).to.be.null
          resp.msg.should.not.be.empty
          done()
        })
    })
  })

  // =============== load(stream_id, from, to) Tests =============== //
  describe('GET load: valid inputs', () => {
    it('should return event list of stream_id', (done) => {
      chai.request(url)
        .get('/streams/0/events/0/1')
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

  describe('GET load: from == to', () => {
    it('should return a single event', (done) => {
      chai.request(url)
        .get('/streams/0/events/0/0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events.length === 1).to.be.true
          done()
        })
    })
  })

  describe('GET load: from > to', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/0/events/1/0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events).to.be.empty
          done()
        })
    })
  })

  describe('GET load: from < 0', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/0/events/-1/0')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events).to.be.empty
          done()
        })
    })
  })

  describe('GET load: invalid stream_id', () => {
    it('should return an empty array', (done) => {
      chai.request(url)
        .get('/streams/-1/events/0/1')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')

          const resp = JSON.parse(res.text)
          expect(resp.events).to.be.empty
          done()
        })
    })
  })

  // =============== push(stream_id, data) Tests =============== //
  describe('POST push: valid stream_id', () => {
    it('should return success code & message', (done) => {
      chai.request(url)
        .post('/streams/0/events')
        .send({
          data: 'TestData'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')

          const resp = JSON.parse(res.text)
          expect(resp.success).to.be.true
          done()
        })
    })
  })

  describe('POST push: invalid stream_id', () => {
    it('should return push error code & message', (done) => {
      chai.request(url)
        .post('/streams/-1/events')
        .send({
          data: 'TestData'
        })
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')

          const resp = JSON.parse(res.text)
          expect(resp.success).to.be.false
          done()
        })
    })
  })
})
