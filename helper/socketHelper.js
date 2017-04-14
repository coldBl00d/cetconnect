var io = require('../app').io;
var clients = require('../app').clients;
var clientHelper = require('./clientHelper');
var userHelper = require('../helper/userHelper');
var socketHelper = {};
var systemVariables = require('../app');
var header = '[socketHelper]';

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
        if(user){
            clients.delete(socket);
            console.log('Client Disconnected '+user);
        }else{
            systemVariables.adminSocket = null;
            console.log(header,'Admin disconnected');
            
        }
    });

    //Identifying admin 
    socket.on('adminIdentify', function(token){
        if(token == systemVariables.adminToken){
            console.log(header,'Admin connected');
            console.log(header,'Storing admin socket');
            systemVariables.adminSocket = socket;
            socket.emit('adminAccepted', {message:"Server connection established"});
        }else{
            socket.emit('tokenRejected', {message:"Your token is invalid"});
        }
    });

    socket.on('getRegisteredCount', function(data) {
       console.log(header,'Admin requested RegisteredCount');
       userHelper.getCount(function(count){
           console.log(header,'sending '+ count + ' users to admin');
           socket.emit('registeredCount', {registeredCount: count});
       });
    });

    socket.on('getOnlineList', function(data){
        if(data.adminToken == systemVariables.adminToken){
            var vIter = systemVariables.clients.values();
            var onlineList = [];
            for (var value of systemVariables.clients.values()) {
                 onlineList.push(value);
            }
            socket.emit('onlineList', {onlineList:onlineList});
        }else{
            console.log(header,'Not sending onlineList, token failed to match');
            
        }
    })

});

