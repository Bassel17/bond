// add your dependencies imports here
const mysql = require('mysql');
const express = require('express'); // requiring express in case needed in this file
const app = express();
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config() // for the .env 

// do not add any dependency import below this line

// database connection credentials
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,

});
// end of database connection credentials


// endpoint to get all users
const getAllusers = async (request, response) => {
    console.log("Return all bond users")
  con.query("SELECT * FROM person", function (err, result) {
     // handling any errors
    if (err) throw err;
       response.status(200).json(result)  
    });
};

// endpoint to persist users
const createUser = async (request, response) => {
    const uid = request.body.uid;
    const name = request.body.name;
    const username =  request.body.username;
    const photo = request.body.photo;
    const email = request.body.email;

    // pick the user from the database
    con.query("SELECT * FROM person WHERE uid="+ mysql.escape(uid), function (err, result) {
        // handling any errors
        if (err) throw err;
            // if query returned data then just login user
            if(result[0]){
                console.log("Normal user login => ");
                response.status(200).json([{status: 'login', message: request.body.name+' Logged in successfully!'}]); 
            }else{
                // if user not in db persist data in the db
                console.log("Persist user => ");
                con.query("INSERT INTO person (uid, name, username, email, photo) VALUES ('"+uid+"','"+name+"','"+username+"','"+email+"','"+photo+"')", function (err, result) {
                    response.status(200).json([{status: 'signup', message: request.body.name+' account created successfully!'}]); 
 
                });
            }
        });
};
// end of endpoint to persist users



//send Invite Button
const sendInvite = async (request, response) => {
    //utilizes the body-parser package
    app.use(express.urlencoded({ extended: false }));
    //need for body parser
    app.use(express.json());
    //mailing options
    const options = {
      auth: {
      //  api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_API_KEY
      }
    }

    const client = nodemailer.createTransport(sgTransport(options));

    con.query("SELECT * FROM person where email='"+request.params.email+"' ", function (err, result) {
      var ret = 0;

      if (err) throw err;
      if (request.params.email == undefined) return
      
      //check if email is already a user
      if(result.length == 0){
        var email = {
          from: 'josephjunejoeee@gmail.com',
          to: request.params.email,
          subject: 'Bond invite❤️',
          text: 'Hi there',
          html: '<h1><b>Bond with '+request.params.email+'</b></h1><h3>A friend wants to bond with you, Download and install Bond now to bond with your loved ones.</h3></br></br><h3>Click the link below to bond now.</h3></br><h3>https://bond-nu.vercel.app/</h3>'
        };
        //sending the email
        client.sendMail(email, function(err, info){
          if (err) throw err;
          ret = 1;
          console.log('Message sent: ' + info.response);  
        });

      }else{
        //send invite to already user
      }

      response.status(200).json(ret);
      /* ret = 0  = not emailed (already exists)
        ret = 1  = emailed new user */
      });
};
//end of send Invite Button


module.exports = {
    getAllusers,
    createUser,
    sendInvite
};