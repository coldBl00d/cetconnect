var io = require('../app').io;
var clients = require('../app').clients;
var clientHelper = require('./clientHelper');
var userHelper = require('../helper/userHelper');
var socketHelper = {};
var systemVariables = require('../app');
var header = '[socketHelper]';
var adminHelper = require('../helper/adminHelper');
function emitToClient(socket, message){
    socket.emit(message);
}

socketHelper.emitToClient = emitToClient;

module.exports = socketHelper;
/**************************************************************** */

io.on('connection', function(socket){ 
    console.log(header,'Client connected');
    socket.emit('identifyYourself');




    socket.on('identify', function(id){        

        if(id){
            console.log(header,'Identifying '+ id);
            clients.set(socket, id);
            adminHelper.send('userLoggedIn', {user:id});
        }else{
            socket.emit("identifyYourself");
        }    
    });

    socket.on('disconnect', function(){
        var user = clients.get(socket); //remove this 
        if(user){
            adminHelper.send('userLoggedOut', {user:user});
            clients.delete(socket);
            if(user == 'admin'){
                console.log(header,'Admin disconnected');
                systemVariables.adminSocket = null;
            }
            else{
                console.log('Client Disconnected '+user);
            }
        }
    });

    //Identifying admin 
    socket.on('adminIdentify', function(token){
        if(token == systemVariables.adminToken){
            clients.set(socket, 'admin');
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
            var onlineList = [];
            for (var value of systemVariables.clients.values()) {
                if(value!="admin")
                 onlineList.push(value);
            }
            socket.emit('onlineList', {onlineList:onlineList});
        }else{
            console.log(header,'Not sending onlineList, token failed to match');
            
        }
    });

    socket.on('registrationStatusChange', function(data) {
       systemVariables.openRegistration = data.status;
       console.log(header,'Registration status :'+systemVariables.openRegistration);
       if(data.status)
            socket.volatile.emit('message', {message:"Registration opened"});
        else
            socket.volatile.emit('message', {message: "Registration closed"});
    });



});

