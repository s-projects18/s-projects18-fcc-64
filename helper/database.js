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
    }).catch(err => { // Promise
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
const booksSchema = new Schema({
  title: {type: String}, //*
	created_on: {type: Date, default: Date.now},//auto
  comments: []
});

// model --------------------------------
const Books = mongoose.model('book', booksSchema ); // Mongoose:book <=> MongoDB:books

// crud --------------------------------
// next(err, docs)

// read all issues 
exports.getBooks = (filter, next) => {
  // doc is a Mongoose-object that CAN'T be modified
  // lean()+exec() will return a plain JS-object instead
  Books.find(filter).lean().exec((err, docs) => { 
    if(err!==null) {
      next(err, null);  
    } else if(docs==null) { // entry doesn't exist
      next('no entry found', null);      
    } else {
      docs.forEach((v)=>{
        v.commentcount=0;
        if(v.hasOwnProperty('comments')) v.commentcount = v.comments.length;
      });
      next(null, docs);
    }
  });
}

exports.insertBook = (insertDataObj, next) => {
  // create object based on model
  let urlObj = new Books(insertDataObj); 
  const pr = urlObj.save();
  pr.then(function (doc) {
    next(null, doc); // new doc created
  }).catch(function(err){
    console.log("error", err);
    next(err, null);
  }); 
}

/*exports.updateIssue = (id, updateDataObj, next) => {
  updateDataObj.updated_on = new Date();
  Issues.findOneAndUpdate({_id: id}, updateDataObj, {new:true}, next);    
}*/

exports.addComment = (bookId, comment, next) => {
  exports.getBooks({_id:bookId}, (err, doc)=>{
        if(err!==null) {
          console.log(err);
          next(err, null);
        } else {
          const book = JSON.parse(JSON.stringify(doc[0])); // just one
          book.updated_on = new Date();
          book.comments.push(comment);
          
          Books.findOneAndUpdate({_id: bookId}, book, {}, (err, doc)=>{
            if(err!==null) {
              next(err, null);
            } else {
              book.commentcount = book.comments.length;
              next(null, book);
            }
          }); 
        }     
  });
}

exports.deleteBook = (id, next) => {
  Books.deleteOne({_id: id}, (err, resultObject) => {
    if(err==null) {
      next(null, resultObject); 
    } else {
      console.log(err); // eg: wrong format for id -> casting error
      next(err, null);     
    }
  });
}

exports.deleteAllBooks = (next) => {
  Books.deleteMany({}, (err, resultObject) => {
    if(err==null) {
      next(null, resultObject); 
    } else {
      console.log(err); 
      next(err, null);     
    }
  });
}