const client=require(`socket.io-client`);
var app=require('express')();
var http=require('http').createServer(app);
const io=require(`socket.io`)(http);
require(`dotenv`);
const port=process.env.port||8080;
const fs=require(`fs`);
var users={};
require(`./bot.js`);
io.on(`connection`,async socket=>{
console.log(`Connection from ${socket.handshake.headers['x-forwarded-for']} to ${socket.handshake.headers.referer}`);
await fs.writeFileSync('./log.txt',`Connection from ${socket.handshake.headers['x-forwarded-for']} to ${socket.handshake.headers.referer}\r\n${fs.readFileSync('./log.txt')}`);
socket.on(`new-user`,async data=>{
console.log(`${data} (${socket.id}) connected`);
await fs.writeFileSync('./log.txt',`${data} (${socket.id}) connected\r\n${fs.readFileSync('./log.txt')}`);
users[socket.id]=data;
socket.broadcast.emit(`server-message`,`${data} (${socket.id}) connected`);
socket.broadcast.emit(`user-list`,users);
socket.broadcast.emit(`new-user`,{user:`${data} (${socket.id})`});
socket.emit(`server-message`,`You are connected as ${data} (${socket.id})`);
});
socket.on(`chat-message`,async data=>{
console.log(`${users[socket.id]} (${socket.id}): ${data.message}`);
await fs.writeFileSync('./log.txt',`${users[socket.id]} (${socket.id}): ${data.message}\r\n${fs.readFileSync('./log.txt')}`);
socket.broadcast.emit(`chat-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message,timestamp:data.timestamp});
});
socket.on(`private-message`,async data=>{
if(data.message.trim().startsWith(`@`)){
var args=data.message.split(` `);
socket.broadcast.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
socket.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
console.log(`${users[socket.id]} (${socket.id}) to ${users[args[0].replace(`@`,``)]} (${args[0].replace(`@`,``)}): ${data.message.replace(args[0],``).trim()}`);
await fs.writeFileSync('./log.txt',`${users[socket.id]} (${socket.id}) to ${users[args[0].replace(`@`,``)]} (${args[0].replace(`@`,``)}): ${data.message.replace(args[0],``).trim()}\r\n${fs.readFileSync('./log.txt')}`);
}
});
socket.on(`get-users`,async data=>{socket.emit(`user-list`,users);});
socket.on(`disconnect`,async data=>{
console.log(`${users[socket.id]} (${socket.id}) disconnected`);
await fs.writeFileSync('./log.txt',`${users[socket.id]} (${socket.id}) disconnected\r\n${fs.readFileSync('./log.txt')}`);
socket.broadcast.emit(`server-message`,`${users[socket.id]} (${socket.id}) disconnected`);
socket.broadcast.emit(`user-left`,{user:`${users[socket.id]} (${socket.id})`,username:users[socket.id],id:socket.id});
delete users[socket.id];
socket.broadcast.emit(`user-list`,users);
});
});

app.get(`/`,(req,res)=>{res.sendFile(__dirname+`/index.html`);});
app.get(`/log`,(req,res)=>{res.sendFile(__dirname+`/log.txt`);});
app.get(`*`,(req,res)=>{
if(req.originalUrl!=`socket.io/socket.io.js`||req.originalUrl!=`log`){
res.sendFile(__dirname+`/${req.originalUrl}`);
}
});


http.listen(port,async ()=>{console.log(`Server started at port ${port}`);await fs.writeFileSync('./log.txt',`Server started at port ${port}\r\n${fs.readFileSync('./log.txt')}`);});