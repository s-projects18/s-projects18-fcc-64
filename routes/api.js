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
var database = require('../helper/database.js');


module.exports = function (app) {
  // - I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData
  // - in stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
  app.route('/api/stock-prices')
    .get(function (req, res){   
      // evaluate input-data --------------
      let stock = req.query.stock;                   // ?stock=a&stock=b -> [a,b]
      if(!(stock instanceof Array)) stock = [stock]; // ?stock=a -> a
   
      let queryLike = false; // likes is not set
      if(req.query.hasOwnProperty('like')) queryLike = (req.query.like=='true' || req.query.like=='1'); // likes is set and true
    
      // ip of the remote client
      const ip = req.ip;  
    
      // Promise chain -------------------
      if(req.query.hasOwnProperty('stock')) {
        getAllStockData(stock)
          .then(result=>{ // delete likes older than 10 minutes (cleanup ips)
            return new Promise((resolve,reject)=>{
              database.deleteAllLikes(10, (e,d)=>{
                if(e==null) resolve(result);
                else reject(e);
              });              
            });
          })        
          .then(result=>{ // get stock data from external api
            var resFiltered = result.map((v)=>{
              return {stock:v.symbol, price:v.latestPrice};
            });
            return {stock: resFiltered};          
          })
          .then(result=>{ 
            // get likes of all queried stocks for this ip  
            // -> filter by ip: we don't want to get millions of entries!
            return new Promise((resolve, reject)=>{ // wrap a Promise around callback
              const filter = stock.map((v)=>{return {stock: v.toUpperCase(), ip:ip}});
              let dbLikes = database.getLikes(filter, (e, d)=>{                
                if(e==null) {  
                  result.likesPerIp = d;
                  resolve(result);
                }
                else reject(e);
              });               
            });            
           })        
          .then(result=>{ // add likes
            // no like=true: nothing to do here
            if(!queryLike) return result;
          
            // add like to stock(s)
            // Loop through all queried stocks with promise all
            const p = [];
            result.stock.forEach(
              (v,i)=> {
                p.push(
                  new Promise((resolve, reject)=>{
                    // stock has related like (for this IP)?
                    var chk = result.likesPerIp.filter(v2=>{
                      return v2.stock==v.stock;
                    });

                    if(chk.length>0) { // like-entry exists, no further will be added
                      resolve(false);                  
                    } else { // insert ---
                      database.insertLikes({
                          stock:result.stock[i].stock,
                          ip: ip
                        }, (e,d)=>{
                          if(e==null) resolve(d);
                          else reject(e);
                      });                    
                    }
                  })
                )}
            );

            return new Promise((resolve,reject)=>{
              Promise.all(p)
                .then(d=>{
                  d.forEach((v,i)=>{
                    if(v!==false) result.likesPerIp.push(v); // add newly inserted like
                  });
                  resolve(result)
                })
                .catch(e=>reject(e)); 
              }
            )           

          })
          .then(result=>{
            // get sums of all queried stocks
            return new Promise((resolve, reject)=>{
              const filter = stock.map((v)=>{return {stock: v.toUpperCase()}});
              database.getAggregateLikes(filter, (e,d)=>{
                if(e==null) {
                  result.likes = d;
                  resolve(result);
                } else reject(e);
              });              
            });
          })
          .then(result=>{ // final
            // add all likes of each stock to each stock
            result.likes.forEach((v,i)=>{
              result.stock.forEach((v2,i2)=>{
                if(v.stock==v2.stock) result.stock[i2].likes=v.likes;  
              });
            });
          
            if(result.stock.length==1) {
              // {"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
              //res.formatter.ok(result.stock[0]); // better way
              res.json({"stockData":result.stock[0]}); // fcc-requirement
            } else {
              // {"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
              result.stock[0].rel_likes = result.stock[0].likes - result.stock[1].likes;
              result.stock[1].rel_likes = result.stock[1].likes - result.stock[0].likes;
              delete result.stock[0].likes;
              delete result.stock[1].likes;
              
              //res.formatter.ok(result.stock);  
              res.json({"stockData":result.stock});
            }
          })
          .catch(e=>{
            res.formatter.badRequest([e]); // TODO: 400 OR 500 ??? check
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
const getAllStockData = (stocks) => {
  return new Promise((resolve, reject)=>{
    const promises = [];
    stocks.forEach((v)=>{
      promises.push( getStockData(v) );
    });
    Promise.all(promises).then(d=>{resolve(d)}).catch(e=>{reject(e)});    
  });
 };

// TODO: handling illegal stockId
const getStockData = (stockId) => {
  return new Promise( (resolve, reject) => {
    request('https://repeated-alpaca.glitch.me//v1/stock/'+stockId+'/quote', function(error, response, body) {
      if(error==null) {
        resolve(JSON.parse(body));
      } else {
        reject(error)
        console.log('error:', error);  
      }
    });
  });
};
