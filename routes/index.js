'use strict';
var express = require('express');
var router = express.Router();
//var tweetBank = require('../tweetBank');
var client = require('../db/index')

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    //console.log("Response: " + res);
    var allTheTweets = client.query('SELECT tweets.id, tweets.userid, tweets.content, users.name, users.pictureurl FROM tweets INNER JOIN users ON tweets.userid = users.id', function (err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    var userName =  req.params.username;
    var tweetsForName = client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userID = users.id WHERE users.name = $1', [userName], function (err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetsWithThatId = client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userID = users.id WHERE tweets.id = $1', [req.params.id], function (err, result) {
        if (err) return next(err); // pass errors to Express
        var tweets = result.rows;
        res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });
    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    //query user table 
    //if user does not exist
    //insert user
    //insert tweet content to tweet table with matching userid
    var userExists = client.query('SELECT * FROM users WHERE name = $1', [req.body.name], function(err, result){
      if (err) return next (err);
      if(result.rows.length){
        //add new user to users table
        //console.log(result.rows);
        client.query('INSERT INTO tweets(userid, content) VALUES ($1, $2)', [result.rows[0].id, req.body.content], function(err, result){
            respondWithAllTweets(req, res, next);
          // client.query('SELECT tweets.id, tweets.userid, tweets.content, users.name, users.pictureurl FROM tweets INNER JOIN users ON tweets.userid = users.id', function (err, result) {
          //   if (err) return next(err); // pass errors to Express
          //   var tweets = result.rows;
          //   res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
          // });
        });
      }
    });

    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    // io.sockets.emit('new_tweet', newTweet);
    // res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
