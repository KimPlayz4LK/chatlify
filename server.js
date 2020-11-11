const client=require(`socket.io-client`);
var app=require('express')();
var http=require('http').createServer(app);
const io=require(`socket.io`)(http);
require(`dotenv`);
const port=process.env.port||8080;
const fs=require(`fs`);
const bannedIps=fs.readFileSync(`./banned-ips.txt`,{encoding:`utf-8`,flag:`r`});
var users={};
require(`./bot.js`);
io.on(`connection`,async socket=>{
console.log(`Connection from ${socket.handshake.headers['x-forwarded-for']} to ${socket.handshake.headers.referer}`);
await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > Connection from ${socket.handshake.headers['x-forwarded-for']} to ${socket.handshake.headers.referer}\r\n${fs.readFileSync('./log.txt')}`);
if(socket.handshake.headers['x-forwarded-for'].includes(`,`)){var ipAddress=socket.handshake.headers['x-forwarded-for'].split(`,`);}else{var ipAddress=[socket.handshake.headers['x-forwarded-for']];}
if(bannedIps.includes(ipAddress[0])){
socket.emit(`server-message`,`<err>Unable to connect to the chat as this IP address was banned from the server.</err>`);
socket.disconnect(true);
}else{
socket.on(`new-user`,async data=>{
console.log(`${data} (${socket.id}) connected`);
await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > ${data} (${socket.id}) connected\r\n${fs.readFileSync('./log.txt')}`);
users[socket.id]=data;
socket.broadcast.emit(`server-message`,`${data} (${socket.id}) connected`);
socket.broadcast.emit(`user-list`,users);
socket.broadcast.emit(`new-user`,{user:`${data} (${socket.id})`});
socket.emit(`server-message`,`You are connected as ${data} (${socket.id})`);
socket.emit(`private-message`,{user:`<srvr>Server<srvr>`,message:`<privatemsg>${data}, if you want to hear sounds for new messages, mentions and other stuff, make sure to just click anywhere in the chat.</rivatemsg>`,to:data,toId:socket.id,originalTo:`@${data}`});
});
socket.on(`user-typing`,async data=>{
users[socket.id]="<img src=\"./typing.gif\" width=\"13\" height=\"13\" style=\"background-color:#888;border-radius:3px;\"> "+data.user;
//socket.broadcast.emit(`user-typing`,{user:users[socket.id],id:socket.id});
//socket.emit(`user-typing`,{user:users[socket.id],id:socket.id});
socket.broadcast.emit(`user-list`,users);
socket.emit(`user-list`,users);
});
socket.on(`user-stopped-typing`,async data=>{
users[socket.id]=data.user;
//socket.broadcast.emit(`user-stopped-typing`,{user:users[socket.id],id:socket.id});
//socket.emit(`user-stopped-typing`,{user:users[socket.id],id:socket.id});
socket.broadcast.emit(`user-list`,users);
socket.emit(`user-list`,users);
});
socket.on(`chat-message`,async data=>{
console.log(`${users[socket.id]} (${socket.id}): ${data.message}`);
await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > ${users[socket.id]} (${socket.id}): ${data.message}\r\n${fs.readFileSync('./log.txt')}`);
socket.broadcast.emit(`chat-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message,timestamp:data.timestamp});
});
socket.on(`private-message`,async data=>{
if(data.message.trim().startsWith(`@`)){
var args=data.message.split(` `);
socket.broadcast.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
socket.emit(`private-message`,{user:`${users[socket.id]} (${socket.id})`,message:data.message.replace(args[0],``).trim(),timestamp:data.timestamp,to:users[args[0].replace(`@`,``)],toId:args[0].replace(`@`,``),originalTo:args[0]});
console.log(`${users[socket.id]} (${socket.id}) to ${users[args[0].replace(`@`,``)]} (${args[0].replace(`@`,``)}): ${data.message.replace(args[0],``).trim()}`);
await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > ${users[socket.id]} (${socket.id}) to ${users[args[0].replace(`@`,``)]} (${args[0].replace(`@`,``)}): ${data.message.replace(args[0],``).trim()}\r\n${fs.readFileSync('./log.txt')}`);
}
});
socket.on(`get-users`,async data=>{socket.emit(`user-list`,users);});
socket.on(`get-ping`,async data=>{socket.emit(`ping-reply`);});
socket.on(`disconnect`,async data=>{
console.log(`${users[socket.id]} (${socket.id}) disconnected`);
await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > ${users[socket.id]} (${socket.id}) disconnected\r\n${fs.readFileSync('./log.txt')}`);
socket.broadcast.emit(`server-message`,`${users[socket.id]} (${socket.id}) disconnected`);
socket.broadcast.emit(`user-left`,{user:`${users[socket.id]} (${socket.id})`,username:users[socket.id],id:socket.id});
delete users[socket.id];
socket.broadcast.emit(`user-list`,users);
});
setInterval(function(){socket.emit(`user-list`,users);},5000);
}
});

app.get(`/`,(req,res)=>{res.sendFile(__dirname+`/index.html`);});
app.get(`/log`,(req,res)=>{res.sendFile(__dirname+`/log.txt`);});
app.get(`*`,(req,res)=>{
if(req.originalUrl!=`socket.io/socket.io.js`||req.originalUrl!=`log`){
res.sendFile(__dirname+`/${req.originalUrl}`);
}
});

http.listen(port,async ()=>{console.log(`Server started at port ${port}`);await fs.writeFileSync('./log.txt',`${new Date().toUTCString()} > Server started at port ${port}\r\n${fs.readFileSync('./log.txt')}`);});