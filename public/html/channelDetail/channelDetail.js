application.controller('channelInfo', ['$rootScope', '$scope', '$mdToast','channelName','$http' , function(rootscope, scope, mdToast, channelName, http){

    var header = '[chanelInfo]';
    scope.waiting = true;
    scope.channelName= channelName;
    scope.channelDetail = {};
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
    


}]);