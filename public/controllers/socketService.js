application.factory('$socket', function($messaging, $rootScope,$mdToast){
    
    var socketFactory = {};
    var socket = io.connect();

    socket.on('loadMessage', function(data){
            console.log('Firing');
            $messaging.loadMessageMetadata(true, function(messages){console.log('loadMessage Fired, completed loading messages');});
    });

    function getSocket(){
        return socket;
    }

    function identify(userId){
        if($rootScope.identify == undefined){
            socket.emit('identify', userId);
            $rootScope.identify = true;
        }
    }

    socket.on('newMessage', function(){
        $messaging.loadMessageMetadata(true, function(messages){
            $mdToast.show($mdToast.simple().textContent('New message!!'));
        });
    });

    socketFactory.getSocket = getSocket;
    socketFactory.identify = identify;

    return socketFactory;

});