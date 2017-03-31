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
    
    socket.on('identify', function(id){
        console.log("Identifying:"+ id);
        clients.set(socket, id);    
    });

    socket.on('disconnect', function(){
        clients.delete(socket);
        console.log('Client Disconnected');
    });

});

