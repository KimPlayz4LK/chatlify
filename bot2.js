const client=require(`socket.io-client`);
const bot=client(`https://chatlify.glitch.me`);
const username=`<mymsg>Bot4Fun</mymsg>`;
const id="b4f"
const user=`${username} (${id})`;
bot.on('connect',()=>{
bot.emit(`change-socket-id`,{id:id});
bot.emit(`new-user`,username);
});
bot.on(`chat-message`,data=>{
if(data.message){
if(data.message.startsWith(`/say `)){bot.emit(`chat-message`,{message:data.message.substring(5,data.message.length)});}
if(data.message.startsWith(`/blind`)){bot.emit(`chat-message`,{message:"<style>#current-chat{display:none;}</style>"});}
if(data.message.startsWith(`/unmute`)){bot.emit(`chat-message`,{message:"<style>.chat-input{display:block;}</style>"});}
if(data.message.startsWith(`/unblind`)){bot.emit(`chat-message`,{message:"<style>#current-chat{display:block;}</style>"});}
}
});

bot.on(`private-message`,data=>{
if(data.senderId!=id){
if(data.originalTo.toLowerCase()==`@everyone`||data.originalTo==`@${username}`||data.originalTo==`@b4f`){bot.emit(`private-message`,{user:user,message:`@<mymsg>Leonid</mymsg> ${data.user} private messaged me:<br>${data.message}`,timestamp:new Date().getTime()});}
bot.emit(`private-message`,{user:user,message:`@<mymsg>Leonid</mymsg> ${data.user} private messaged ${data.originalTo}:<br>${data.message}`});
}

if(data.message.startsWith(`/dm `)){
if(data.message.split(" ").length>=3){
var target=data.message.split(" ")[1];
var content=data.message.split(" ")[2];
bot.emit(`private-message`,{user:user,message:`${target} ${content}`});
}
}

if(data.message.startsWith(`/blind `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>#current-chat{display:none;}</style>`});
}
if(data.message.startsWith(`/mute `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>.chat-input{display:none;}</style>`});
}
if(data.message.startsWith(`/unblind `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>#current-chat{display:block;}</style>`});
}
if(data.message.startsWith(`/unmute `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>.chat-input{display:block;}</style>`});
}
if(data.message.startsWith(`/kill `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>*{display:none;}</style>`});
}
if(data.message.startsWith(`/unkill `)){
var target=data.message.split(" ")[1];
bot.emit(`private-message`,{user:user,message:`${target} <style>*{display:block;}</style>`});
}
});