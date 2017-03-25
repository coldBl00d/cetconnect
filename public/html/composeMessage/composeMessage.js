application.factory('$loadUsers', function($http){
    var header = '[loadUsersService]';
    var users=[];

    function loadUsers(callback){
        if(users.length>0){
            return users;
        }else{
            $http.get(address+'messages/getUsers').then(function(res){
            users= res.data
            console.log('Users loaded from server.'+ users);
            callback();
            },
            function(err){
                console.log("Can't load user at this time.");
            });
        }
    }

    loadUsers(function(){});

    function getUsers(){
        if(users.length>0)
            return users;
        else{
            loadUsers(function(){return users;});
        }
    }

    return{
        getUsers: getUsers 
    }

});

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

    return search

})

application.controller('messageController',function($scope, $rootScope, $querySearch){

    $scope.userList= [];
    $scope.selectedItem = null;
    $scope.searchText = null;
    $scope.querySearch = function(searchText){
        $querySearch(searchText, function (data){$scope.userList = data;});  
    }

});

