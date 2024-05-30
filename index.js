const express=require("express");
const cors=require("cors");
const mongoose = require("mongoose");
const userRoutes =require("./routes/userRoutes");
const messageRoutes =require("./routes/messageRoutes");
const socket=require('socket.io');
const path=require('path');
const app=express();

app.use(express.static(path.join(__dirname, 'build')));
require("dotenv").config();
 
app.use(cors());

app.use(express.json());

app.use("/api/auth",userRoutes);     
app.use("/api/messages",messageRoutes);     

app.get('*', (req, res) =>
    res.sendFile(path.resolve('build', 'index.html'))
  );

mongoose.connect(process.env.MONGO_URL)
.then(()=>{console.log("DB Connection Successfull");
})
.catch(
    (err)=>{
        console.log(err.message);
    }
)

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server Started on Port ${process.env.PORT}`);
})

const io=socket(server,{
    cors:{
        origin:"*",
        credentials:true,
    },
});

global.onlineUsers=new Map();

io.on("connection",(socket)=>{ 
global.chatSocket=socket;
socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);   
});

socket.on("send-msg",(data)=>{   
    const sendUserSocket=onlineUsers.get(data.to);
    if(sendUserSocket){
        socket.to(sendUserSocket).emit("msg-recieve",data.message);
    }
});
});


