application.factory('$validateAdmin', ['$rootScope', '$state','$http', '$socket', function(rootscope, state, http){
    
    var validateAdmin = {};
    
    validateAdmin.validate = function(callback) {
        if(rootscope.adminToken){
            http.post(address+'admin/validate', {"adminToken":rootscope.adminToken})
            .then(function(res){
                if(res.status == 200){
                    return callback(true);
                    state.go('adminDash');
                }else {
                    return callback(false);
                    state.go('adminConsoleLogin');
                }
            })
            .catch(function(err){
                return callback(false);
                state.go('adminConsoleLogin');
            });
        }else{
            console.log('Has no admin token redirect to admin login');
            return callback(false);
            state.go('adminConsoleLogin');
        }
    }

    validateAdmin.stay = function(callback){
        
        validateAdmin.validate(function(result){
            if(result){ //change this to result
                state.go('adminDash');
            }else{
                state.go('adminConsoleLogin');
            }
            callback(result); //change this to result
        });
    }


    return validateAdmin;

}]);

application.controller('dashController', ['$rootScope', '$scope', '$http','$validateAdmin','$mdExpansionPanel','$socket', function(rootscope, scope, http, validateAdmin, mdExpansionPanel, socket){
    var header = "[dashController]";
    

     
    validateAdmin.stay(function(result){
        if(result){
            socket.dataListeners(scope);    

             /*mdExpansionPanel().waitFor('panelOne').then(function (instance) {
                 instance.expand();
                 instance.collapse({animation: false});
                 instance.remove();
                 instance.isOpen();
                 console.log('done with initialising panel instance');
                
             });*/
            
          
            mdExpansionPanel('Users').expand();
            mdExpansionPanel('Channels').expand();
            mdExpansionPanel('Database').expand();
        }
    });
    
    

     scope.channelList = [];
     scope.channelCount = 0;
     scope.registeredCount = 0;
     scope.openRegistration = true;
     scope.onlineList = [];   
     scope.onlineCount = 0;
}]);

