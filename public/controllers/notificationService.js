application.factory('$notificationService', ['$http','$mdToast', function($http, $mdToast){

    const messaging = firebase.messaging();
    var token;
    var notificationService = {};

    function identify(callBack) {
        messaging.requestPermission()
        .then(function() {
            console.log('Notification permission granted.');
            messaging.getToken()
            .then(function(currentToken){
                token = currentToken;
               callBack(currentToken);
                $http.post(address+'newDevice',{deviceToken: currentToken})
                .then(function(res){
                    $mdToast.show($mdToast.simple().textContent(res.data.m));
                })
                .catch(function(err){
                    $mdToast.show($mdToast.simple().textContent("Cant reach server to identify the device"));
                });
            })
            .catch(function(err) {
                $mdToast.show($mdToast.simple().textContent('Cant reach server'));
            });
        })
        .catch(function(err) {
            $mdToast.show($mdToast.simple().textContent('You will not recieve any notifications on this device'));
        });
    }

    
    function getToken(){
        console.log('Calling get token');
        if(token)
            return token;
        else
            identify(function(currentToken){
                return currentToken;         
            });
    }

    notificationService.getToken = getToken;
    notificationService.identify = identify;

    return notificationService;

}]);