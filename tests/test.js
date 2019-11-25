const chai = require('chai'),
    chaiHttp = require('chai-http'),
    app = require('../server.js');

// Configuring Chai
chai.use(chaiHttp);
chai.should();

describe("run server", () => {
    describe("run", () => {
        it("App must run wihtout errors", (done) => {
            chai.request(app).get("/").end((err, res) => {
                res.should.have.status(200);
                done();
            })
        })
    })
})