const net = require('net');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let client = net.createConnection({port: 5000}, () => {
    console.log('connected')
});

client.on('data', data => {
    console.log(`${data}`);
});

rl.on('line', (input) => {
    if(input === 'exit()'){
        console.log('exiting program');
        client.destroy();
        process.exit();
    }
    else{
        client.write(input);
    }

});