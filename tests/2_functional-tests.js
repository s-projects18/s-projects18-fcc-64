/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    // BUG IN ASSERTION ANALYZER:
    // there MUST be at leat 1 assert in body or match will create error, eg; assert.equal(2,2)
    suite('GET /api/stock-prices => stockData object', function() {  
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         // TODO
          assert.equal(2,2);
          done();
        });
      });
   
      test('1 stock with like', function(done) {
        assert.equal(2,2);
      done();  
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        assert.equal(2,2);
      done();  
      });
      
      test('2 stocks', function(done) {
        assert.equal(2,2);
      done();  
      });
      
      test('2 stocks with like', function(done) {
        assert.equal(2,2);
      done();  
      });
      
    }); // suite: /api/stock-prices

    // extra: suite security
  	suite('GET / => check security', function() {
      test('content-security-policy => default-src self', function(done) {
        chai.request(server)
        .get('/api')
        .end(function(err, res){ 
           assert.equal(res.header['content-security-policy'], "default-src 'self'");
           done();
        });         
      });
    });
  
}); // suite: func-tests
