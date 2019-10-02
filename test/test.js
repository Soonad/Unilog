const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/server')
const utils = require('../src/utils/utils')
const im = require('../src/event_storage/in-memory')

const url = ('http://localhost:3000/api')
const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

describe('Unilog Tests', () => {
  // =============== Utils Tests =============== //
  describe('base64_url_encode: input with padding', () => {
    it('should return correct URL base64 encoding', () => {
      const original = 'testInput1' // base64 is dGVzdElucHV0MQ==
      const encoded = utils.base64_url_encode(Buffer.from(original))
      expect(encoded === 'dGVzdElucHV0MQ').to.be.true
    })
  })

  describe('base64_url_decode: input with padding', () => {
    it('should return correct string from URL base64', () => {
      const original = 'dGVzdElucHV0MQ'
      const decoded = utils.base64_url_decode(original) // base64 would be dGVzdElucHV0MQ==
      expect(decoded.toString('ascii') === 'testInput1').to.be.true
    })
  })


  describe('isBase64: ascii input', () => {
    it('should return true', () => {
      const original = 'test'
      const encoded = utils.base64_url_encode(Buffer.from(original))
      expect(utils.isBase64(encoded)).to.be.true
    })
  })

  describe('isBase64: non-ascii input', () => {
    it('should return true', () => {
      const original = 'téçt'
      const encoded = utils.base64_url_encode(Buffer.from(original)) // URL safe
      expect(utils.isBase64(encoded)).to.be.true
    })
  })

  describe('isSizeValid: size < max_size', () => {
    it('should return true', () => {
      const original = 'test'
      const encoded = utils.base64_url_encode(Buffer.from(original)) // URL safe
      expect(utils.isSizeValid(encoded, 8)).to.be.true
    })
  })

  describe('isSizeValid: size = max_size', () => {
    it('should return true', () => {
      const original = 'test'
      const encoded = utils.base64_url_encode(Buffer.from(original)) // URL safe
      expect(utils.isSizeValid(encoded, 4)).to.be.true
    })
  })

  describe('isSizeValid: size > max_size', () => {
    it('should return false', () => {
      const original = 'test'
      const encoded = utils.base64_url_encode(Buffer.from(original)) // URL safe
      expect(utils.isSizeValid(encoded, 3)).to.be.false
    })
  })

  // =============== In Memory Storage Tests =============== //
  describe('In Memory length: existing stream_id', () => {
    it('should return 2', async () => {
      expect(await im.length('MQ')).to.equal(2)
    })
  })

  describe('In Memory length: non-existing stream_id', () => {
    it('should return 0', async () => {
      expect(await im.length('non-existing')).to.equal(0)
    })
  })

  describe('In Memory load: existing stream_id', () => {
    it('should return 2 events', async () => {
      expect((await im.load('MQ', 0, 1)).length).to.equal(2)
    })
  })

  describe('In Memory load: non-existing stream_id', () => {
    it('should return 0 events', async () => {
      expect(await im.load('non-existing', 0, 1)).to.be.empty
    })
  })

  describe('In Memory load: \"to\" out of bounds', () => {
    it('should return 0 events', async () => {
      console.log("\n\n" + JSON.stringify(await im.load('MQ', 0, 999)) + "\n\n")
      expect((await im.load('MQ', 0, 999))).to.be.empty
    })
  })

  describe('In Memory load: \"from\" & \"to\" out of bounds', () => {
    it('should return 0 events', async () => {
      expect(await im.load('MQ', 900, 999)).to.be.empty
    })
  })

  describe('In Memory push', async () => {
    it('should include new stream and event', async () => {
      expect(await im.length('Mw')).to.equal(0)
      expect(await im.load('Mw', 0, 0)).to.be.empty
      await im.push('Mw', 'test data')
      expect(await im.length('Mw')).to.equal(1)
      expect(((await im.load('Mw', 0, 0))[0].data)).to.equal('test data')
    })
  })

  // =============== length(stream_id) Tests =============== //
  describe('GET get_stream: valid stream_id', () => {
    it('should return stream_id length correctly', (done) => {
      chai.request(url)
        .get('/streams/MQ')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true
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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

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
          expect(res.header["content-type"] == 'application/json; charset=utf-8').to.be.true

          const resp = JSON.parse(res.text)
          resp.error.should.not.be.empty
          expect(resp.error.includes("too")).to.be.true
          done()
        })
    })
  })
})
