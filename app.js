const express = require("express");
const app = express();
const url = "mongodb://localhost:27017";
const dbName = "Netflix_Database";
const collectionName ="Netflix";
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
let collection;

app.get('/',(req,res)=>{res.send("Hello");
console.log(collection);
});

app.listen(3000,()=>{console.log("Server is running")
client.connect(function (err){
    if(err) throw err;
    console.log("connected to db");
    db = client.db(dbName);
    collection = db.collection("Netflix");
})
});