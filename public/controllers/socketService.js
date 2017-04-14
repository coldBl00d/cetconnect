application.factory('$socket', function($messaging, $rootScope,$mdToast){
    
    var socketFactory = {};
    var socket = io.connect();
    var header = '[socketService]';
    

    socket.on('loadMessage', function(data){
            console.log(header,'Event loadmessage recieved from server');
            $messaging.loadMessageMetadata(true, function(messages){console.log('loadMessage Fired, completed loading messages');});
    });

    //this guy is new -- note to keku
    socket.on('identifyYourself', function(data){
        console.log(header,'Server asked to identify');
        console.log(header,'Identifying as '+ $rootScope.currentUser.userId);
        socketFactory.identify($rootScope.currentUser.userId);
    });

    function getSocket(){
        return socket;
    }

    //this function changed -- note to keku when implementing sockets
    function identify(userId){
        socket.emit('identify', userId);
    }

    socket.on('newMessage', function(){
        $messaging.loadMessageMetadata(true, function(messages){
            $mdToast.show($mdToast.simple().textContent('New message'));
        });
    });

    socketFactory.getSocket = getSocket;
    socketFactory.identify = identify;


     socket.on('registerdCount', function(data) {
       console.log(header,'registerdCount fired in client when request emited by admin');
       
    });


    return socketFactory;

});