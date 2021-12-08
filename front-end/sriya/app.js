const express = require("express");
const app = express();
const port = 3000;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dbName = "netflix";
const client = new MongoClient(url);
const fs = require('fs');

let col, col2;
app.use(express.static('public'))

app.get("/directors",(req,res)=>{
    fs.readFile("directors.html",(err,data)=>{
        res.writeHead(200, {"context-Type": "text/html"});
        res.end(data);
    })
});

app.get("/directors.js",(req,res)=>{
    fs.readFile("directors.js",(err,data)=>{
        res.writeHead(200, {"context-Type": "text/javascript"});
        res.end(data);
    })
});

app.get("/data1", (req, res) => {
    col.find({}, {}).toArray(function(e, r) {
        if(e) throw e;
        res.status(200);
        res.append("Context-Type", "application/json");
        res.send(r);
    })
})

app.get("/cast",(req,res)=>{
    fs.readFile("directors.html",(err,data)=>{
        res.writeHead(200, {"context-Type": "text/html"});
        res.end(data);
    })
});

app.get("/cast.js",(req,res)=>{
    fs.readFile("cast.js",(err,data)=>{
        res.writeHead(200, {"context-Type": "text/javascript"});
        res.end(data);
    })
});

app.get("/data2", (req, res) => {
    col2.find({}, {}).toArray(function(e, r) {
        if(e) throw e;
        res.status(200);
        res.append("Context-Type", "application/json");
        res.send(r);
    })
})


app.listen(port, ()=>{
    console.log("server is running");
    client.connect(function(err) {
        if (err) throw err;
        console.log("connected to db");
        db = client.db(dbName);
        col = db.collection("data1");
        col2 = db.collection("data2");

    })
});