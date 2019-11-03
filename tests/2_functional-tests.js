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
    let globLikes = -1;
  
    // BUG IN ASSERTION ANALYZER:
    // there MUST be at least 1 assert in body or match will create error, eg; assert.equal(2,2)
    suite('GET /api/stock-prices => stockData object', function() {  
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.statusCode,200);
          const obj = JSON.parse(res.text);
          assert.property(obj, 'stockData');
          assert.property(obj.stockData, 'stock');
          assert.property(obj.stockData, 'price');
          assert.equal(obj.stockData.stock, 'GOOG');
          assert.isNumber(obj.stockData.price);
          done();
        });
      });
   
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'a', like: 'true'})
        .end(function(err, res){
          assert.equal(res.statusCode,200);
          const obj = JSON.parse(res.text);
          assert.equal(obj.stockData.stock, 'A');
          assert.property(obj.stockData, 'likes');
          assert.isNumber(obj.stockData.likes);
          assert.isAtLeast(obj.stockData.likes, 1);
          globLikes = obj.stockData.likes;
          done();
        }); 
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'a', like: 'true'})
        .end(function(err, res){
          assert.equal(res.statusCode,200);
          const obj = JSON.parse(res.text);
          assert.equal(obj.stockData.likes, globLikes);
          done();
        });  
      });
      
      test('2 stocks', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['c', 'd']}) // ?stock=c&stock=d are interpreted as array!
        .end(function(err, res){
          assert.equal(res.statusCode,200);
          const obj = JSON.parse(res.text);
          assert.property(obj, 'stockData');         
          assert.isArray(obj.stockData);
          assert.equal(obj.stockData[0].stock, 'C');
          assert.equal(obj.stockData[1].stock, 'D');
          assert.isNumber(obj.stockData[0].price);
          assert.isNumber(obj.stockData[1].price);
          done();
        });  
      });
      
      test('2 stocks with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['aa', 'bb'], like: 'true'})
        .end(function(err, res){
          assert.equal(res.statusCode,200);
          const obj = JSON.parse(res.text);        
          assert.equal(obj.stockData[0].stock, 'AA');
          assert.equal(obj.stockData[1].stock, 'BB');
          assert.property(obj.stockData[0], 'rel_likes');
          assert.property(obj.stockData[1], 'rel_likes');
          assert.isNumber(obj.stockData[0].rel_likes);
          assert.isNumber(obj.stockData[1].rel_likes);
          assert.equal(0, obj.stockData[0].rel_likes + obj.stockData[1].rel_likes);
          done();
        }); 
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
