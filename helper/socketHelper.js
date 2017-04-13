var io = require('../app').io;
var clients = require('../app').clients;
var clientHelper = require('./clientHelper');
var socketHelper = {};

function emitToClient(socket, message){
    socket.emit(message);
}

socketHelper.emitToClient = emitToClient;

module.exports = socketHelper;
/**************************************************************** */

io.on('connection', function(socket){ 
    console.log('client Connected ');
    socket.emit('identifyYourself');

    socket.on('identify', function(id){
        if(id){
            console.log("Identifying:"+ id);
            clients.set(socket, id);
        }else{
            socket.emit("identifyYourself");
        }    
    });

    socket.on('disconnect', function(){
        var user = clients.get(socket); //remove this 
        clients.delete(socket);
        console.log('Client Disconnected '+user);
    });

});

