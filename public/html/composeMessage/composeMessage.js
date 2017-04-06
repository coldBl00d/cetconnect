application.factory('$querySearch', function($http){

    function esacpe(query){
        var esc_query = query.replace('%20','+');
        return esc_query;
    }

    function search(query, callback){
        var userList;
        $http.get(address+'messages/getUsers/?query='+escape(query))
             .then(function(response){
                 callback(Array.from(JSON.parse(response.data)));
             })
             .catch(function(err){
                 console.log('Server not reachable for searching user returning empty array');
             });

    }

    return search;

})

application.factory('$sendMessage', function($http, $mdToast){

    function send(message, $scope) {
        $http.post(address+'messages/send', {message:message})
             .then(function(res){
                 if(res.status == 200){
                     $mdToast.show($mdToast.simple().textContent('Message Sent'));
                      $scope.message.recipientId = null;
                        $scope.message.message = null;
                        $scope.selectedItem = null;
                        $scope.message.subject = null;
                 }else{
                     console.log("message not sent");
                     $mdToast.show($mdToast.simple().textContent('Message not sent.'));
                 }
             })
    }

    return send;

});

application.controller('messageController',function($scope, $rootScope, $querySearch, $sendMessage, $validateLogin){
    $validateLogin();
    $scope.userList= [];
    $scope.selectedItem = null;
    $scope.searchText = null;
    $scope.querySearch = function(searchText){
        $querySearch(searchText, function (data){$scope.userList = data;});  
    }
    $scope.send = function(){
        $scope.message.recipientId = $scope.selectedItem.userId;
        $scope.message.senderId = $rootScope.currentUser.userId;
        $scope.message.timestamp = new Date();
        $scope.message.senderName = $rootScope.currentUser.name;
        $scope.message.recipientName = $scope.selectedItem.name;
        $sendMessage($scope.message, $scope);
    }

});

