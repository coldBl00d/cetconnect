application.controller('channelInfo', ['$rootScope', '$scope', '$mdToast','channelName','$http','$querySearch' , function(rootscope, scope, mdToast, channelName, http, querySearch){

    var header = '[chanelInfo]';
    scope.waiting = true;
    scope.channelName= channelName;
    scope.channelDetail = {};
    scope.moderatorList = [];
    scope.addwait = false;
    
    console.log(header,channelName);

    http.get(address+'admin/getChannelData/'+channelName)
    .then(function(res){
        mdToast.show(mdToast.simple().textContent(res.data.message));
        scope.waiting = false;
        console.log(header,res.data);
        scope.channelDetail = res.data.channel;
    })
    .catch(function(err){
        scope.waiting = false;
        mdToast.show(mdToast.simple().textContent('Something went wrong'));
        console.log(header,err);
    });


     scope.querySearch = function(searchText){
        querySearch(searchText, function (data){scope.moderatorList = data;});  
     }

     scope.addMod = function () {
         var header = '[addMod]';
         var payload = {
             userId: scope.selectedItem.userId,
             channelName: scope.channelName,
             adminToken: rootscope.adminToken
         }

         console.log(header,payload);

         scope.addwait = true;
         http.post(address+'admin/addMod',{payload:payload})
         .then(function(res){
             scope.addwait = false;
             mdToast.show(mdToast.simple().textContent(res.data.message));
             if(res.status == 200){
                 scope.searchText = "";
                 scope.channelDetail.admins.push(res.data.mod);
             }
         })
         .catch(function(err){
             scope.addwait = false;
             console.log(header,err);
             mdToast.show(mdToast.simple().textContent('Something went wrong'));
         });
         


     }
    


}]);

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

});