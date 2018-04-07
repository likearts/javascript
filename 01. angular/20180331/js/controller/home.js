(function(){
    angular.module('home',['baseModel','apiList','utils'])
    .controller('homeCtrl',function($scope,restApi,apiManager,baseService,baseObserver){
        baseService.getObserver(baseObserver.loading).set(true);
        restApi({url:apiManager.mainContent})
            .then(function(){
                baseService.getObserver(baseObserver.loading).set(false);
            })
    })
    .factory('loadInit',function(baseService,baseObserver,amortized){
        return function(scope){
            baseService.getObserver(baseObserver.restApi).getDefer()
            .then(null,null,function(res){
                scope.allItems = amortized(res.data,10); // 배열을 10개 묶음으로 나눔
                scope.photoItems = scope.allItems[0];
                console.log(scope.photoItems);
            });
        }
    })
    .directive('photoList',function(loadInit,scrollPage,$timeout,baseService,baseObserver){
        return {
            scope:true,
            restrict:'EA',
            link:function(scope){
                scope.page = 0;
                scope.allItems = [];
                scope.photoItems = [];

                loadInit(scope);
                scrollPage().then(null,null,function(state){
                    if(state) scope.getMore();
                });
                scope.getMore = function(){
                    if(scope.page<scope.allItems.length && !baseService.getObserver(baseObserver.loading).get()) {
                        baseService.getObserver(baseObserver.loading).set(true);
                        scope.page++;
                        scope.photoItems = scope.photoItems.concat(scope.allItems[scope.page]);
                        $timeout(function(){
                            baseService.getObserver(baseObserver.loading).set(false);
                        },1000);
                    }
                }
            }
        }
    })
})();