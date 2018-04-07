(function(){
    angular.module('home',['baseModel','apiList'])
    .controller('homeCtrl',function($scope,restApi,apiManager){
        restApi({url:apiManager.mainContent})
    })
    .directive('photoList',function(baseService,baseObserver){
        return {
            scope:true,
            restrict:'EA',
            link:function(scope){
                scope.photoItems = [];
                baseService.obsList.list[baseObserver.restApi].getDefer()
                .then(null,null,function(res){
                    scope.photoItems = res.data;
                    console.log(scope.photoItems);
                });
            }
        }
    })
})();