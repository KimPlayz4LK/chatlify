const chatInput=document.getElementById(`chat-input-content`);
var lastValue=chatInput.value,lastTypingEmit,pingStart,pingErrorTimeout;
function newChatMessage(user,message) {
var msg=document.createElement(`div`);
msg.classList=`chat-message`;
var msgUser=document.createElement(`p`);
msgUser.innerHTML=user;
msgUser.classList=`chat-message-user`;
var msgContent=document.createElement(`p`);
msgContent.innerHTML=message;
msgContent.classList=`chat-message-content`;
var msgTimestamp=document.createElement(`p`);
msgTimestamp.innerHTML=`${new Date().getFullYear()}.${new Date().getMonth()}.${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
msgTimestamp.classList=`chat-message-timestamp`;
msg.appendChild(msgUser);
msg.appendChild(msgContent);
msg.appendChild(msgTimestamp);
document.getElementById(`current-chat`).appendChild(msg);
document.getElementById(`current-chat`).scrollTop=document.getElementById(`current-chat`).scrollHeight;
}
function setPing(ping){
if(!isNaN(ping)){
if(ping>400){
document.getElementById(`ping-indicator`).innerHTML=`<err>Ping: ${ping}ms</err>`;
}else if(ping>200){
document.getElementById(`ping-indicator`).innerHTML=`<warn>Ping: ${ping}ms</warn>`;
}else if(ping>0){
document.getElementById(`ping-indicator`).innerHTML=`<success>Ping: ${ping}ms</success>`;
}}else{
document.getElementById(`ping-indicator`).innerHTML=`<err>Ping error (${ping})</err>`;
}
}
newChatMessage(`<srvr>Server</srvr>`,`Connecting to the server`);
const socket=io();
const username=prompt(`Enter your username`,`Guest_${Math.round(Math.random()*10000)}`);

function sound(src){
this.sound=document.createElement("audio");
this.sound.src=src;
this.sound.setAttribute("preload","auto");
this.sound.setAttribute("controls","none");
this.sound.style.display="none";
document.body.appendChild(this.sound);
this.play=function(){this.sound.play();}
this.stop=function(){this.sound.pause();}
}
chatInput.focus();
chatInput.addEventListener(`keyup`,e=>{
if(e.keyCode==13){document.getElementById(`chat-input-send`).click();}
});
document.getElementById(`chat-input-send`).onclick=function(e){
if(chatInput.value!=``){
e.preventDefault();
if(chatInput.value.trim().startsWith(`@`)){
socket.emit(`private-message`,{user:username,message:chatInput.value,timestamp:new Date().getTime()});
newChatMessage(`<privatemsg>>> ${chatInput.value.trim().split(` `)[0].replace(`@`,``)}</privatemsg>`,chatInput.value.replace(chatInput.value.split(` `)[0],``).trim());
}else{
socket.emit(`chat-message`,{user:username,message:chatInput.value,timestamp:new Date().getTime()});
newChatMessage(`<mymsg>${username} (${socket.id})</mymsg>`,chatInput.value);
}
chatInput.value=``;
}
};

socket.on(`chat-message`,data=>{new sound(`./sound.mp3`).play();newChatMessage(data.user,data.message);});
socket.on(`ping-reply`,data=>{clearTimeout(window[`pingErrorTimeout`]);setPing(new Date().getTime()-window[`pingStart`]);});
setInterval(function(){
window[`pingStart`]=new Date().getTime();socket.emit(`get-ping`);
window[`pingErrorTimeout`]=setTimeout(function(){setPing(`Server disconnected`);},3000);
},1000);
socket.on(`private-message`,data=>{
console.log(`private-message`);
if(data.toId==socket.id||data.originalTo.toLowerCase()==`@everyone`||data.originalTo==`@${username}`){
new sound(`./ping.mp3`).play();
newChatMessage(`<privatemsg>${data.user}</privatemsg>`,data.message);
}
});
socket.on(`server-message`,data=>{new sound(`./sound.mp3`).play();newChatMessage(`<srvr>Server</srvr>`,data);});
socket.on(`error-message`,data=>{new sound(`./sound.mp3`).play();newChatMessage(`<err>Server</err>`,data);});
socket.on(`custom-message`,data=>{new sound(data.sound||`./sound.mp3`).play();newChatMessage(data.user||`<custom>Server</custom>`,data.message);});
socket.on(`user-list`,data=>{refreshUserList(data);});
socket.on(`disconnect`,()=>{new sound(`./disconnect.mp3`).play();newChatMessage(`<err>Server</err>`,`You are disconnected from the server`);});
socket.on(`connect`,()=>{socket.emit(`new-user`,username);new sound(`./connect.mp3`).play();newChatMessage(`<success>Server</success>`,`You are (re)connected to the server`);socket.emit(`get-users`);});

setInterval(function(){
if(window[`lastValue`]!=chatInput.value.trim()){
if(window[`lastTypingEmit`]!=`started`){
socket.emit(`user-typing`,{user:username});
window[`lastTypingEmit`]=`started`;
}}else{
if(window[`lastTypingEmit`]!=`stopped`){
socket.emit(`user-stopped-typing`,{user:username});
window[`lastTypingEmit`]=`stopped`;
}}
window[`lastValue`]=chatInput.value.trim();
},1000);

socket.on(`user-typing`,data=>{
if(!document.getElementById(`user_${data.id}`).innerHTML.startsWith("<img src=\"./typing.gif\"")){
document.getElementById(`user_${data.id}`).innerHTML="<img src=\"./typing.gif\" width=\"13\" height=\"13\" style=\"background-color:#888;border-radius:3px;\"> "+document.getElementById(`user_${data.id}`).innerHTML;
}});

socket.on(`user-stopped-typing`,data=>{
document.getElementById(`user_${data.id}`).innerHTML=data.user;
});

function refreshUserList(users) {
document.getElementById(`user-list`).innerHTML=``;
for(var user in users){
var el=document.createElement(`div`);
el.innerHTML=`<user id='user_${user}'>${users[user]}</user><br><id>${user}</id>`;
if(user==socket.id){el.classList=`self-card`;}
document.getElementById(`user-list`).appendChild(el);
}
}