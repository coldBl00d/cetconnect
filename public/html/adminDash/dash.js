application.factory('$validateAdmin', ['$rootScope', '$state','$http', '$socket', function(rootscope, state, http){
    var header = '[$validateAdmin]';

    var validateAdmin = {};
    
    validateAdmin.validate = function(callback) {
        if(rootscope.adminToken){
            http.post(address+'admin/validate', {"adminToken":rootscope.adminToken})
            .then(function(res){
                if(res.status == 200){
                    console.log(header,'token validated');
                    
                    return callback(true);
                    state.go('adminDash');
                }else {
                    console.log(header,'Bad token');
                    return callback(false);
                    state.go('adminConsoleLogin');
                }
            })
            .catch(function(err){
                console.log(header,'post error');
                console.log(header,err);
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
            console.log(header,'ValidateAdmin.validate retured '+ result);
            
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

application.controller('dashController', ['$rootScope', '$scope', '$http','$validateAdmin','$mdExpansionPanel','$socket', '$registration', '$mdDialog', '$mdToast' , function(rootscope, scope, http, validateAdmin, mdExpansionPanel, socketService, registration, mdDialog, mdToast){
    var header = "[dashController]";
    
    var socket;

    /*New Registration*/
    scope.newUser = {};
    scope.postList = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'Faculty'];
    scope.departmentList = ['Applied Electronics' , 'Civil', 'Computer' , 'Electrical', 'Electronics' , 'Industrial' , 'Mechanical' ];
    rootscope.new_user_response = true;
    /***************** */
     scope.showUI = function () { registration.showUI(scope); }
     scope.channelList = [];
     scope.channelCount = 0;
     scope.registeredCount = 0;
     scope.openRegistration = true;
     scope.onlineList = [];   
     scope.onlineCount = 0;
     scope.waiting = false;
     scope.batch = "";
     scope.channelAddWaiting = false;
     scope.channelPayload = {};
     rootscope.rootscope_channelListWait = true; 



    validateAdmin.stay(function(result){        
        if(result){
            socket = socketService.getSocket();
            socketService.dataListeners(scope);    

            mdExpansionPanel('Users').expand();
            mdExpansionPanel('Channels').expand();
            mdExpansionPanel('Extra').expand();

        }
    });
    
    scope.registrationChange = function(status){
        console.log(header,'Registration change');
        socket.emit('registrationStatusChange', {status:status});
    }


    /* User console */
    scope.addUser = function () { registration.addUser(scope, scope.newUser); }
    
    /*Delete User UI */

    scope.showDeleteUser = function () {

        mdDialog.show({
            templateUrl: 'html/deleteUser/del.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            controller:'delUser',
            preserveScope:true,
            
        })
        .then(function(answer) {

        },function() {
            console.log("cancelled dialog");
        
        });

    }


     scope.batchDelete = function(batch){
        scope.waiting = true;
        
        var payload = {
            adminToken : rootscope.adminToken, 
            batch : batch
        }
        console.log(header,payload);
        
        http.post(address+'admin/batchDelete', {payload:payload} )
        .then(function(res){
            mdToast.show(mdToast.simple().textContent(res.data.message));
            scope.waiting = false; 

        })
        .catch(function(err){
            scope.waiting = false; 
            console.log(header,err);
            mdToast.show(mdToast.simple().textContent('Server unreachable'));
        });
        
     }
     /* ************************* */


     /* Channel Console */

     scope.addChannel = function() {
         var header = '[addchannelRequest]';
         
         scope.channelAddWaiting = true;
         scope.channelPayload.adminToken = rootscope.adminToken;
         http.post(address+'admin/addChannel',{payload: scope.channelPayload})
         .then(function(res){
             console.log(header,'Response ' + res.status);
             scope.channelAddWaiting = false;
             mdToast.show(mdToast.simple().textContent(res.data.message));
             if(res.status == 200){
                 scope.channelPayload.channelName = "";
                 scope.channelPayload.admin = "";
                 socketService.getChannelList();
             }
         })
         .catch(function(err){
             scope.channelAddWaiting = false;
             mdToast.show(mdToast.simple().textContent('Something went wrong.'));
         }); 
     }

     scope.channelDetail = function(channelName){
        console.log(header,'Opening dialog for channel '+ channelName);
        mdDialog.show({
            locals:{channelName: channelName },                
            clickOutsideToClose: true,                
            templateUrl: 'html/channelDetail/channelDetailDialog.html',
            controller: 'channelInfo',
        });

     }


     /* *********************************** */


     /*change password************************/

        scope.password_wait = false;
        scope.passwordPayload = {
            userId: rootscope.adminId,
            adminToken: rootscope.adminToken
        }

        scope.changePassword = function() {
            if( (scope.passwordPayload.newPassword == scope.passwordPayload.confirm) && (scope.passwordPayload.confirm.length > 3) ){

                scope.password_wait = true;
                var header = '[changePassword]';
                http.post(address+'admin/changePassword',{payload:scope.passwordPayload})
                .then(function(res){
                   mdToast.show(mdToast.simple().textContent(res.data.message));
                   scope.password_wait = false;
                   if(res.status==200){
                       scope.passwordPayload.oldPassword ="";
                       scope.passwordPayload.newPassword = "";
                       scope.passwordPayload.confirm ="";
                   }
                })
                .catch(function(err){
                    mdToast.show(mdToast.simple().textContent("Something went wrong"));
                    scope.password_wait = false;
                });
            }else{
                mdToast.show(mdToast.simple().textContent('Make sure the new password is same in the confirm field or length is greater than 3 character'));
            }  
        }

     /*************************************** */

     /* STATS *********************************/

        scope.stat_wait = true;

     /**************************************** */


}]);

application.controller('delUser', ['$rootScope' , '$socketConnect', '$http', '$scope', '$mdToast', function(rootscope, socketconnect, http, scope, mdToast){

    var header = '[delUser]';
    

    var socket = socketconnect.getSocket();
    scope.data = {};
    scope.data.user = {};
    scope.data.showList = true;
    scope.data.user_data_returned = false;
    scope.data.user.name = "Akhil";
    scope.data.user.post="s8";
    scope.data.user.department = "CSE";
    scope.data.user.batch = "2013";
    scope.data.waiting = false;

    scope.showIdUI = function () {
        scope.data.showList = false;
    }


    scope.find = function () {
        scope.data.waiting = true;
        scope.data.user_data_returned=false; 
        http.post(address+'admin/findUser', {userId: scope.data.userId, adminToken: rootscope.adminToken})
        .then(function(res){
            
            scope.data.waiting = false;
            mdToast.show(mdToast.simple().textContent(res.data.message));
            if(res.status == 200) {
                console.log(header,res.data);
                
                scope.data.user_data_returned = true;
                scope.data.user.name = res.data.user.name;
                scope.data.user.post = res.data.user.post;
                scope.data.user.department = res.data.user.department;
                scope.data.user.batch = res.data.user.batch;
                scope.data.user.user_token = res.data.user.user_token;
            }

        })
        .catch(function(err){
            console.log(header,err);
            scope.data.waiting=false;
            mdToast.show(mdToast.simple().textContent('Server Error'));
        });
        
    }

    scope.deleteUser = function () {

        scope.data.waiting = true;


        var payload = {
            adminToken : rootscope.adminToken, 
            user_token : scope.data.user.user_token
        }

        console.log(header,payload);
        

        http.post(address+'admin/deleteUser',{payload:payload})
        .then(function(res){
            scope.data.waiting = false;
            mdToast.show(mdToast.simple().textContent(res.data.message));
            if(res.status == 200){
                scope.data.user_data_returned = false;
                scope.data.user.name = null;
                scope.data.user.post = null
                scope.data.user.department = null ; scope.data.user.user_token = null;
                scope.data.user.batch = null;
            }    
        })
        .catch(function(err){
            scope.data.waiting = false;
            console.log(header,err);
            mdToast.show(mdToast.simple().textContent('Server error'));
        })
        


    }


    


}]);