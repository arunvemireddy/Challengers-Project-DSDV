const express = require("express");
const app = express();
app.get('/',(req,res)=>res.send("Hello"));

app.listen(3000,()=>console.log("Server is running"));

const {MongoClient} = require("mongodb");

async function main(){
    const url = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
    const client = new MongoClient(url);
    try{
        await client.connect();
        await listDatabases(client);
    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }
}
    main().catch(console.error);

let database =[];
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(element => {
        console.log(element.name);
        database.push(element.name);
    });
}

app.get("/getdatabase",(req,res)=>res.send(database));