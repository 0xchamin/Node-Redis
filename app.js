const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//Create Redis client
let client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis');
});

//Set up port
const port = 3000;

//Init app
const app = express();

//View engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

//body bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

//methodOverride
app.use(methodOverride('_method'));


//Creating routes
//route to search page
app.get('/', function(req, res, next){
  res.render('search_users');
});

// search form processing
app.post('/user/search', function(req, res, next){
  let id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
      res.render('search_users', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

//add user page
app.get('/user/add', function(req, res, next){
  res.render('add_user');
});

//process add user page
app.post('/user/add', function(req, res, next){
  let id = req.body.id ;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email ;
  let phone = req.body.phone ;

  client.hmset(id,[
    'first_name' , first_name,
    'last_name' , last_name,
    'email' , email,
    'phone' , phone
  ], function(err, reply){
    if(err){
      console.log("Error occured "+err);
    }else{
      console.log(reply);
      res.redirect('/');
    }
  });
});

//Delete uesr route
app.delete('/user/delete/:id', function(req, res, next){
  //id pass from url : so params
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, function(){
  console.log('Server started on port '+port);
});
