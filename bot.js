const client=require(`socket.io-client`);
const bot=client(`http://localhost`);
bot.on('connect',()=>{
bot.emit(`new-user`,`<span style='color:#88f;'>ChatlifyBot</span>`);
});
bot.emit(`chat-message`,{message:`Hello i am ChatlifyBot! Use the /help command to start using me!`});
bot.on(`chat-message`,data=>{
if(data.message.startsWith(`/help`)){bot.emit(`chat-message`,{message:`
<br>Here's a command list:<br>
<ul>
<li>/retype - Retypes the text wrote after the command</li>
<li>/say - Same as the <i>/retype</i> command.</li>
</ul>
`})}
if(data.message.startsWith(`hello`)){bot.emit(`chat-message`,{message:`Hello there, ${data.user}!`});}
if(data.message.startsWith(`/retype `)){bot.emit(`chat-message`,{message:data.message.substring(8,data.message.length)});}
if(data.message.startsWith(`/say `)){bot.emit(`chat-message`,{message:data.message.substring(5,data.message.length)});}
});
bot.on(`new-user`,data=>{
bot.emit(`chat-message`,{message:`Welcome to the chat, ${data.user}! I am a bot, so you can type /help to get a list of commands!`});
});
bot.on(`user-left`,data=>{
bot.emit(`chat-message`,{message:`We hope you had nice time, ${data.user}.`});
});