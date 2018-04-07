(function(){
    angular.module('layout',['baseModel'])
    .directive('lkHead',function(baseService,baseObserver){
        return {
            scope:true,
            restrict:'EA',
            templateUrl:'/inc/head.html',
            //template:'<div>head</div>',
            link : function(scope){
                baseService.obsList.list[baseObserver.headstate].getDefer()
                .then(null,null,function(state){
                    scope.state = state;
                })
            }
        }
    })
    .directive('lkFoot',function(){
        return {
            scope:true,
            restrict:'EA',
            templateUrl:'/inc/foot.html',
           // template:'<div>foot</div>',
            link : function(scope){

            }
        }
    })
    .directive('contentContainer',function(baseService,baseObserver){
        return function(scope){
            baseService.obsList.list[baseObserver.headstate].getDefer()
            .then(null,null,function(state){
                scope.headState = state;
            })
        }
    })
})();