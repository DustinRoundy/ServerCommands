const net = require('net');
const fs = require('fs');
let counter = 0;
let clientArry = [];
let writeStream = fs.createWriteStream('./chat.log');

function whisperMessage(client, user, message) {
    if (!user) {
        client.write('No user provided!')
    }
    else if(!message){
        client.write('You cant send an empty message!')
    }
    else{
        client.write(`You whispered "${message}" to ${user}`);
        clientArry.forEach(reciever => {
            if (reciever.username === user){
                reciever.write(`${client.username} Whispered: ${message}`);
            }
        })
    }

}
function changeUsername(client, username){
    let oldUsername = client.username;
    clientArry.forEach(user => {
        if(user === client){
            client.username = username;
        }
    });
    sendMessage(client, `updated their username from ${oldUsername}`);

}
function kickUser(client, user){
    clientArry.forEach((reciever, index) => {
        if(user === reciever.username) {
            reciever.end('You have been kicked.');
            clientArry.splice(index, 1);
        }
    });
    clientArry.forEach(() => {
        sendMessage(client, 'left the chat');
    });
}

let server = net.createServer(client => {
    counter++;
    client.username = 'Guest' + counter;
    clientArry.push(client);
    sendMessage(client, 'joined the chat');
    client.write('Welcome to the server!');
    client.on('data', data => {

        if(data[0].toString() === "47"){
            let commands = data.toString().split(' ');
            console.log(typeof(commands[0]));
            if (commands[0] === '/w'){
                whisperMessage(client, commands[1], commands[2]);
            }
            else if (commands[0] === "/username"){
                changeUsername(client, commands[1]);
            }
            else if (commands[0] === "/kick") {
                if(commands[2] === "testpw"){
                    kickUser(client, commands[1]);
                }
            }
            else if (commands[0] === '/clientlist'){
                client.write('Current User List:\r\n');
                clientArry.forEach(user => {
                    client.write(`${user.username}\n`);
                })
            }
            else{
                client.write("You have entered an invalid command.")
            }

        }
        else {
            sendMessage(client, data);
        }
    });
    client.on('close', () => {
        clientArry.forEach((reciever, index) => {
            if(reciever === client) {
                clientArry.splice(index, 1);
            }
        });
        clientArry.forEach(() => {
            sendMessage(client, 'left the chat');
        });

    });

}).listen(5000);

console.log('Listening on port 5000');


function sendMessage(client, message) {
    console.log(`${client.username}: ${message}`);
    writeStream.write(`${client.username}: ${message}` + '\r\n');
    clientArry.forEach(reciever => {
        if (client === reciever){
            return;
        }
        else{
            reciever.write(`${client.username}: ${message}`);
        }
    });
}