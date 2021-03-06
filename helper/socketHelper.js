var io = require('../app').io;
var clients = require('../app').clients;
var clientHelper = require('./clientHelper');
var userHelper = require('../helper/userHelper');
var socketHelper = {};
var systemVariables = require('../app');
var header = '[socketHelper]';
var adminHelper = require('../helper/adminHelper');

var messageHelper = require('../helper/messagesHelper');
var deviceHelper = require('../helper/deviceHelper');
var channelHelper = require('../helper/channelHelper');
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

    socket.on('getOpenRegistration', function(data) {
        console.log(header,'getOpenRegistration fired');
        
       if(data.adminToken == systemVariables.adminToken){
            openRegistration = systemVariables.openRegistration;
            socket.emit('openRegistration', {openRegistration:openRegistration});
        }else{
            console.log(header,'Not sending openRegistration status, token failed to match');
           socket.volatile.emit('message', {message:"Try loggin in again"});   
       }
    });


    socket.on('getChannelList', function(data) {
       
       if(data.adminToken == systemVariables.adminToken){
            channelHelper.getAllChannels (function(channels){
                console.log(header,'sending channel list to admin');
                socket.emit('channelList', {channelList: channels});
            });
       }else{
           console.log(header,'Not sending onlineList, token failed to match');
           socket.volatile.emit('message', {message:"Try loggin in again"});
       }

    });

    socket.on('getStatistics' , function(data){
        var header = '[getStatistics]';

        var operations = 4;
        var payload= {};
        userHelper.getSize(function(result){
            payload.user = result;
            if(--operations == 0){
                socket.emit('statistics', {statistics:payload});
            }else{
                console.log(header,'set user');
            }
        });

        channelHelper.getSize(function(result){
            payload.channel = result;
            if(--operations == 0){
                socket.emit('statistics', {statistics:payload});
            }else{
                console.log(header,'set channel');
            }
        });

        messageHelper.getSize(function(result){
            payload.message = result;
            if(--operations == 0){
                socket.emit('statistics', {statistics:payload});
            }else{
                console.log(header,'set message');
            }
        });
        
        deviceHelper.getSize(function(result){
            payload.device = result;
            if(--operations == 0){
                socket.emit('statistics', {statistics:payload});
            }else{
                console.log(header,'set device');
            }
        });


    });



});

