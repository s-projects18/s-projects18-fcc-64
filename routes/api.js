/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

// https://www.npmjs.com/package/request
// - Request is designed to be the simplest way possible to make http calls
var request = require('request');

// using: helper/database.js
//var expect = require('chai').expect;
//var MongoClient = require('mongodb');
//const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  // - I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData
  // - in stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
  app.route('/api/stock-prices')
    .get(function (req, res){   
      let likes = false; // likes is not set
      if(req.query.hasOwnProperty('likes')) likes = (req.query.likes=='true'); // likes is set and true

      if(likes) {
        // ip of the remote client
        const ip = req.ip;    
        
        // TODO
        // add like to db
        
        // get likes all stocks
        
        // calculate rellikes
      }
   
    
      if(req.query.hasOwnProperty('stock')) {
        let stock = req.query.stock;
        if(!(stock instanceof Array)) stock = [stock];
        getAllStockData(stock, result=>{
          var resFiltered = result.map((v)=>{
            return {stock:v.symbol, price:v.latestPrice};
          });
          res.formatter.ok(resFiltered); // 200  
        });        
      } else {
        res.formatter.badRequest(['no stock argument given']); // 400
      }
    });  
};


// alternative to google finance
// https://repeated-alpaca.glitch.me/ to get up-to-date stock price information without needing to sign up for your own key
// https://en.wikipedia.org/wiki/Ticker_symbol
//  > A stock symbol may consist of letters, numbers or a combination of both
const getAllStockData = (stocks, done) => {
  const promises = [];
  stocks.forEach((v)=>{
    promises.push( getStockData(v) );
  });
  Promise.all(promises).then(v=>{done(v)});
 };

const getStockData = (stockId) => {
  return new Promise( (resolve) => {
    request('https://repeated-alpaca.glitch.me//v1/stock/'+stockId+'/quote', function (error, response, body) {
      if(error==null) {
        resolve(JSON.parse(body));
      } else {
        console.log('error:', error);  
      }
    });
  });
};
