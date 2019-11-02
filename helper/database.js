var mongo = require('mongodb');
var mongoose = require('mongoose');
// https://mongoosejs.com/docs/deprecations.html#-findandmodify-
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
var Schema = mongoose.Schema;

// connect --------------------------------
exports.connect = () => {
  // connect to database
  mongoose.connect(process.env.DB, {
      useNewUrlParser: true
    })
    .then(()=>{
      console.log("db connected");
  })
    .catch(err => { 
      console.log(err);
    });
}

// check connection -----------------------
exports.checkConnection = () => {
  /*
  0: disconnected
  1: connected
  2: connecting
  3: disconnecting
  */
  if(mongoose.connection.readyState==0 || mongoose.connection.readyState==3) {
    console.log("no-connection: "+mongoose.connection.readyState);
    return false;
  }  
  return true;
}

// schema --------------------------------
const likesSchema = new Schema({
  stock:{type: String}, //*
  ip: {type: String}, //*
	created_on: {type: Date, default: Date.now} //auto
});

// model --------------------------------
const Likes = mongoose.model('like', likesSchema ); // Mongoose:like <=> MongoDB:likes

// crud --------------------------------
// Promise-schema: Foo.then().catch()
// callback: next(err, docs)

// get all related likes 
exports.getLikes = (filter, next) => {
  Likes
    .find()
    .or(filter)
    .then(data=>{
      next(null, data);
    })
    .catch(err=>{
      next(err, null);
    });
}

// get sum of all likes for each stock
// filterMatch: [{stock:'B'}, {stock:'A'}]
// > similar to: WHERE stock='A' OR stock='B'
//
// $group:
// > _id is a must in mongoose and it will be grouped
// > {'$first':"$stock"} is an accunulator object
// > stock has the same information as _id
exports.getAggregateLikes = (filterMatch, next) => {
  Likes.aggregate([
    {$match: {$or: filterMatch}},
    {$group:{_id: "$stock", stock: {'$first':"$stock"}, likes:{$sum:1}}}
  ])
  .exec( (e,d)=>{
      if(e==null) next(null, d);
      else next(e)
    } );
};

// insert
exports.insertLikes = (insertDataObj, next) => {
  // create object based on model
  let urlObj = new Likes(insertDataObj); 
  const pr = urlObj.save();
  pr.then((doc) => {
    next(null, doc); // new doc created
  }).catch((err)=> {
    console.log("insertLikes-error", err);
    next(err, null);
  }); 
}

// update and return updated object
// not needed anymore
exports.updateLikes = (filter, update, next) => {
  Likes.findOneAndUpdate(filter, update, {new:true}, (err, resultObject) => {
    if(err==null) {
      next(null, resultObject);
    } else {
      console.log(err); 
      next(err, null);       
    } 
  })    
};

exports.deleteAllLikes = (next) => {
  Likes.deleteMany({}, (err, resultObject) => {
    if(err==null) {
      next(null, resultObject); 
    } else {
      console.log(err); 
      next(err, null);     
    }
  });
}