application.controller('adminLogin', ['$rootScope', '$scope', '$http','$mdToast', function(rootScope, scope, http, mdToast){
    rootScope.hidesidebar = true;
    var payload = {
        userId: "", 
        password: ""
    };

    scope.payload = payload;
    
    scope.login = function () {
        http.post(address+'admin', payload)
        .then(function(res){
            if(res.status == 200){
                rootScope.adminToken = res.adminToken;
               // $state.go();
            }else if(res.status == 201) {
                mdToast.show(mdToast.simple().textContent("Check credential"));
            }
        })
        .catch(function(err) {
            console.log("Something is wrong");
            console.log(err);
            mdToast.show(mdToast.simple().textContent("Something went wrong"));
        });
    }    
}]);


