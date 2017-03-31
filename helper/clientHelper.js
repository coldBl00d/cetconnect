var systemVariables = require('../app');
var clients = systemVariables.clients;
var clientHelper = {};

function getClientSockets(clientId, callBack){
    clients.forEach(function(value, key, map){
        if(value == clientId){
            console.log('Found socket for '+ clientId);
            callBack(key);
        }
    });
}

clientHelper.getClientSockets = getClientSockets;

module.exports = clientHelper;