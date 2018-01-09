var express = require('express');
var router = express.Router();
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '',
//   database : 'chatting01'
// });
/* GET home page. */

const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chatting',
  password: '0546533836',
  port: 54321,
});

router.get('/', function(req, res, next) {

  if(!req.session.user){
      req.session.user = "";
  }
  res.render('index', { user: req.session.user });
});

router.get('/session-join/:user', function(req, res, next) {
  if(!req.session.user){
      req.session.user = req.params.user;
  }
  res.send(req.session.user);
});
router.post('/insert-message',function(req, res, next) {
      var user = req.session.user;
      var message = req.body.message;
      var values = [user, message];
      //connection.query('INSERT INTO `message`(`name`, `messages`) VALUES ("'+user+'","'+message+'")'); 

      (async () => {
        const client = await pool.connect()
        try {
          const res = await client.query('INSERT INTO message (name, messages) VALUES ($1, $2)', [user, message])
          console.log(res.rows[0])
        } finally {
          client.release()
        }
      })().catch(e => console.log(e.stack));


});

router.get('/logout/:user',(req, ress, next)=>{
    req.session.destroy(function(err) {
      var user = req.params.user;
      (async () => {
        const client = await pool.connect()
        try {
          const res = await client.query('DELETE FROM online WHERE name= $1', [user]);
          ress.redirect('/');
          console.log(res.rows[0])
        } finally {
          client.release()
        }
      })().catch(e => console.log(e.stack));
    //   connection.query('DELETE FROM `online` WHERE name="'+ user +'"'); 
    //   res.redirect('/');
     });
});

router.get('/check/:user', function(req, ress, next) {
    var user = req.query.user;
    (async () => {
        const client = await pool.connect()
        try {
          const res = await client.query('SELECT * FROM online WHERE name = ($1)', [user])
          //socket.broadcast.emit('listUser', data);
          if(typeof res.rows[0] == 'undefined' ){
            ress.send("true");
          }else
          ress.send("false");
          
        } finally {
          client.release()
        }
      })().catch(e => {
        console.log("qqqqqqqq : " + e.stack);
              
      });
      
      
    
});

module.exports = router;
