const client=require(`socket.io-client`);
var app=require('express')();
var http=require('http').createServer(app);
const io=require(`socket.io`)(http);
const port=80;
var users={};
require(`./bot.js`);
io.on(`connection`,socket=>{
console.log(`Connection from ${socket.handshake.headers.host} (${socket.handshake.address}) to ${socket.handshake.headers.referer}`);
socket.on(`new-user`,data=>{
console.log(`${data} (${socket.id}) connected`);
users[socket.id]=data;
socket.broadcast.emit(`server-message`,`${data} (${socket.id}) connected`);
socket.broadcast.emit(`user-list`,users);
socket.emit(`server-message`,`You are connected as ${data} (${socket.id})`);
});
socket.on(`chat-message`,data=>{
console.log(`${users[socket.id]} (${socket.id}): ${data.message}`);
socket.broadcast.emit(`chat-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message,timestamp:data.timestamp});
});
socket.on(`private-message`,data=>{
if(data.message.trim().startsWith(`@`)){
var args=data.message.split(` `);
socket.broadcast.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
socket.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
console.log(`${users[socket.id]} (${socket.id}) to ${users[args[0].replace(`@`,``)]} (${args[0].replace(`@`,``)}): ${data.message.replace(args[0],``).trim()}`);
}
});
socket.on(`get-users`,data=>{socket.emit(`user-list`,users);});
socket.on(`disconnect`,data=>{
console.log(`${users[socket.id]} (${socket.id}) disconnected`);
socket.broadcast.emit(`server-message`,`${users[socket.id]} (${socket.id}) disconnected`);
delete users[socket.id];
socket.broadcast.emit(`user-list`,users);
});
});

app.get(`/`,(req,res)=>{res.sendFile(__dirname+`/index.html`);});
app.get(`*`,(req,res)=>{
if(req.originalUrl!=`socket.io/socket.io.js`){
res.sendFile(__dirname+`/${req.originalUrl}`);
}
});


http.listen(port,()=>{console.log(`Server started at port ${port}`);});