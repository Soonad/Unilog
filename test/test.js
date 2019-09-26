const chai      = require("chai");
const chaiHttp  = require("chai-http");
const app       = require("../src/server");

const url = ('http://localhost:3000');
const should = chai.should();
chai.use(chaiHttp);


describe("Unilog Server", () => {
  describe("GET /", () => {
    it("should return {hello: \"world\"}", (done) => {
      chai.request(url)
          .get('/')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              done();
           });
    });
  });

  describe("GET /other_route", () => {
    it("should return {hello: \"kitty\"}", (done) => {
      chai.request(url)
          .get('/other_route')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              done();
           });
    });
  });
});
