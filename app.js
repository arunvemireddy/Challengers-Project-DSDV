const express = require("express");
const app = express();
const fs = require('fs');
const url = "mongodb://127.0.0.1:27017";
const dbName = "Netflix_Database";
const collectionName ="Netflix";
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
let collection;



app.use(express.static('front-end/arun'));
app.use(express.json());

//database connection
app.listen(3000,()=>{console.log("Server is running")
client.connect(function (err){
    if(err) throw err;
    console.log("connected to db");
    db = client.db(dbName);
    collection = db.collection(collectionName);
    //console.log(collection);
    })
});

// mapvis - arun
app.get('/map',function(req,res){
    fs.readFile("front-end/arun/arun.html",(err,data)=>{
    res.writeHead(200,{"Content-Type":"text/html"});
    res.end(data);
    })
})

app.get('/bar',function(req,res){
    fs.readFile("mitch.html",(err,data)=>{
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(data);
    })
})

app.get('/main_barchart.js', (req, res) => {
    fs.readFile('main_barchart.js', (err, data) => {
        res.status(200);
        res.append('Context-Type', 'text/javascript');
        res.send(data);
    })
})

// get countries from database - arun
app.get('/getCountries',(req,res)=>{
    collection.find({},{projection:{country:1}}).toArray(function(e,r){
      if(e) throw e;
      res.send(r);
    })
});

app.get('/getTitleInfo',(req,res)=>{
    collection.find({},{projection:{_id:0, country:1, listed_in:1, type:1, rating:1}}).toArray(function(e,r){
        if(e) throw e;
        res.status(200);
        res.append("Context-Type", "application/json");
        res.send(r);
    })
});

// get country details from database - arun
app.post('/getCountryData',(req,res)=>{
    value=req.body.country;
    if(value=='united states of america'){
        value='United States';
    }
    console.log(value)
    collection.find({country:{ $regex : new RegExp(value, "i") }},{projection:{type:1}}).toArray(function(e,r){
      if(e) throw e;
      res.send(r);
    })
});