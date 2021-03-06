const express = require("express");
const app = express();
const fs = require('fs');
const url = "mongodb://127.0.0.1:27017";
const dbName = "Netflix_Database";
const collectionName ="Netflix";
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
let collection;


app.use(express.static('/'));
app.use(express.static('public'));
app.use(express.json());

//database connection
app.listen(3000,()=>{console.log("Server is running")
client.connect(function (err){
    if(err) throw err;
    console.log("connected to db");
    db = client.db(dbName);
    collection = db.collection(collectionName);
    })
});

// mapvis api
app.get('/map',function(req,res){
    fs.readFile("front-end/arun/arun.html",(err,data)=>{
    res.writeHead(200,{"Content-Type":"text/html"});
    res.end(data);
    })
})

// get countries from database 
app.get('/getCountries',(req,res)=>{
    collection.find({},{}).toArray(function(e,r){
      if(e) throw e;
      res.send(r);
    })
});
// api call for barchart grid
app.post('/getBarData',(req,res)=>{
    let country = req.body.country;
    if(country==='United States of America'){
        country='United States';
    }
    if(country !== null) {
        collection.find({country: {$regex: new RegExp(country, "i")}},
            {projection: {_id: 0, country: 1, listed_in: 1, type: 1, rating: 1}}).toArray(function (e, r) {
            if (e) throw e;
            res.status(200);
            res.append("Context-Type", "application/json");
            res.send(r);
        })
    } else {
        collection.find({},
            {projection: {_id: 0, country: 1, listed_in: 1, type: 1, rating: 1}}).toArray(function (e, r) {
            if (e) throw e;
            res.status(200);
            res.append("Context-Type", "application/json");
            res.send(r);
        })
    }
});

// get country details from database
app.post('/getCountryData',(req,res)=>{
    value=req.body.country;
    if(value==='United States of America'){
        value='United States';
    }
    console.log(value)
    collection.find({country:{ $regex : new RegExp(value, "i") }},{}).toArray(function(e,r){
      if(e) throw e;
      res.send(r);
    })
});

// api call for ratings in line chart
app.post('/getCountryDataRatings',(req,res)=>{
    value=req.body.country;
    if(value==='United States of America'){
        value='United States';
    }
    console.log(value)
    collection.find({country:{ $regex : new RegExp(value, "i") }},{projection:{rating:1}}).toArray(function(e,r){
        if(e) throw e;
        res.send(r);
      })
});

// send html file back
app.get('/',function(req,res){
    fs.readFile("public/html/app.html",(err,data)=>{
    res.writeHead(200,{"Content-Type":"text/html"});
    res.end(data);
    })
})