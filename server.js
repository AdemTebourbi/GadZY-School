const express = require('express')
const app = express()
const port = 3000
const { Client } = require('pg')
const Discord = require('discord.js');
const bot = new Discord.Client();
const bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
const path = require('path');

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Comptes",
    password: "GadZy0000",
    port: "5432"
    })

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gadzy.school@gmail.com',
        pass: 'GadZy0000'
      }
    });



bot.login('MTAwMDc3MjA2MzUwNzc5NjA2MA.GWO3CB.Qfe3baPSqSemVnjY_0tFk8v8EKTU8M-5uZa1d8');
client.connect()
app.use(bodyParser.urlencoded({
    extended:true
}));


client.query('SELECT * FROM public."Comptes";')
.then(results => console.table(results.rows))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/Views/index.html'));
})
app.get('/Activate Account', (req, res) => {
    var UserID = req.query.id;
    client.query('UPDATE public."Comptes" SET "Actif"=true WHERE "id" =$1',[UserID]);
})

app.get('/Login', (req, res) => {
    var Email = req.query.email;
    var Password = req.query.password;

    console.log('Email = '+Email+' Password = '+Password);

    client.query('Select * From public."Comptes" Where "Email" = $1', [Email])
    .then(results => TryConnect(results.rows[0].Password, Password, res, results.rows[0].Pseudo))  
})

app.get('/BuyFormation', (req, res) => {
    var Formation = req.query.Form;
    var UserID = req.query.id;
    if (Formation == "ue"){
        client.query('Select * From public."Comptes" Where "id" = $1', [UserID])
        .then(results => BuyFormation(results.rows[0].PorteFeille, 150,UserID, res, results.rows[0].Pseudo)) 
        
    }
})

app.post('/Account', (req, res) => {
    var Pseudo = req.body.Pseudo;
    var Birthday = req.body.Birthday;
    var Email = req.body.Email;
    var Password = req.body.password;
    console.log("New Post"+Pseudo+Birthday+Email+Password);
    client.query('INSERT INTO public."Comptes"("Email", "Password", "Pseudo", "Birthday", "PorteFeille", "Actif")VALUES ($1, $2, $3, $4, $5, $6);', [Email, Password, Pseudo, Birthday, 0, false]);
    client.query('Select * From public."Comptes" Where "Email" = $1', [Email])
    .then(results => SendConfirm(results.rows[0])) 
})
  





  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })



  //functions

  function BuyFormation(PorteFeille , Price, user, res, Pseudo)
  {
    const channel = bot.channels.cache.get('1000738591611305994');
    if (PorteFeille >= Price){
        client.query('UPDATE public."Comptes" SET "PorteFeille"=$1 Where "id" = $2', [PorteFeille-Price,user])
        channel.send("Thank you "+ Pseudo+ " for buying the Formation");
        let url = channel.createInvite({maxAge: 0, maxUses: 1});
        channel.send(url.toString());
        
}
else {res.send("Sorry You don't have this price")}
  }


  function TryConnect(Results, Passwordt, res, Name)
  {
    if (Results == Passwordt){
      res.send("Mr "+Name+" , Successfully connected to your account")
    }
  }

  function SendConfirm(Row)
  {
    var html = "<a herf = 'localhost:3000/Activate Account?id="+Row.id+"'><button>Confirm</button></a>"
    var mailOptions = {
      from: 'gadzy.school@gmail.com',
      to: Email,
      subject: 'Comfirm Email',
      text: html
    };
   Row
  }