import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import React from "react";
import Clock from "react-live-clock"

const app=express();
const port=3000;
const url="http://localhost:4040";
var appuser;
var records=[];
var contact_records=[];
var chats=[];
var currentDate = new Date(); var currentTime = currentDate. toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true });
var time;
var lastchat;
var receiver;
var sender;
console.log(currentTime);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db=new pg.Client({
   user:"postgres",
   password:"dj272511",
   database:"postgres",
   port:5433,
   host:"localhost"
});

db.connect();


db.query("SELECT * FROM login;",(err,res)=>{
       if(err){
        console.log(err);
       }else{
         records=res.rows;
         console.log(records);
       }
});



app.get("/",(req,res)=>{
   res.render("login.ejs");
});

app.post("/",async(req,res)=>{
    const user=req.body.user;
    const pass=req.body.pass;

    const finded=records.find((record)=> record.username==user);

    try{
      if(finded.passkey==pass){
        db.query(`SELECT * FROM login WHERE username!='${user}'`,(err,res)=>{
                 if(err){
                    console.log(err);
                 }else{
                  contact_records=res.rows;
                 }
        });
        appuser=user;
        console.log(appuser);
        res.redirect("/contacts");
      }else{
        res.render("login.ejs",{error:"yes",name:user});
      }
    }catch{
      console.log("username doesn't exist!!!");
      res.render("login.ejs",{nouser:"yes"});
    }
      


    console.log(records);
});



app.get("/signup",(req,res)=>{
      res.render("signup.ejs");
});

app.post("/signup",(req,res)=>{
    const user=req.body.user;
    const pass=req.body.pass;
    const retyped=req.body.retype;

    const finded=records.find((record)=> record.username==user);
    if(pass!==retyped){
      res.render("signup.ejs",{nomatch:"yes"});
    }else if(finded==user){
      res.render("signup.ejs",{exist:"yes"});
  }else{
    db.query(`INSERT INTO login VALUES('${user}','${pass}');`,(err,res)=>{
          if(err){
            console.log(err);
          }else{
            console.log(res.rows);
          }
    });
    res.redirect("/contacts");
  }
});

app.get("/contacts",(req,res)=>{
      res.render("contacts.ejs",{Time:currentTime,users:contact_records,chated:chats});
});

app.get("/chat/:name",(req,res)=>{
  const user=req.params.name;
  receiver=user;
  sender=user;

  db.query(`SELECT chats.chat,chats.time,chats.reciever,login.username
  FROM chats 
  INNER JOIN login ON chats.name=login.username ;`,(err,res)=>{
       if(err){
         console.log(err);
       }else{
         chats=res.rows;
         console.log(chats);
       }
  });

  chats.forEach((chat)=>{
      lastchat=chat.chat;
  });

  res.redirect("/chat");
});

app.get("/chat",(req,res)=>{
  chats.forEach((chat)=>{
       time=chat.time;
       lastchat=chat.chat;
  });
  console.log(chats);
  console.log(sender);
  res.render("chat.ejs",{chated:chats,users:contact_records,Time:time,recentchat:lastchat,time_now:currentTime,currentuser:appuser,received:receiver,sended:sender});
});

app.post("/send",async(req,res)=>{
     const chat_message=req.body.message;

     console.log(receiver);
     db.query(`INSERT INTO chats VALUES('${chat_message}','${appuser}','${currentTime}','${receiver}')`,(err,res)=>{
                  if(err){
                    console.log(err);
                  }else{
                    
                  }
     });
  
     const result=await axios.post(`${url}/receive`,req.body);
     const response=result.data;
     console.log(response);
     

     res.redirect("/chat");
});


app.post("/receive",(req,res)=>{
     const received=req.body.message;
     console.log(received);
     

     res.json("Received Successfully!!!");
     
});




app.listen(port,()=>{
  console.log(`Server is running on port ${port}`);
});