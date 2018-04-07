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
        return function(scope,el){
            baseService.obsList.list[baseObserver.headstate].getDefer()
            .then(null,null,function(state){
                scope.headState = state;
            })
            baseService.obsList.list[baseObserver.scrollHeight].set(0);
            scope.$watch(function(){
                return el[0].scrollHeight;
            },function(n,o){
                if(!n||n==o||n===undefined) return;
                console.log('update scrollHight', el[0].clientHeight)
                baseService.obsList.list[baseObserver.scrollHeight].set(n);
            })
        }
    })
    .config(function($provide){
        $provide.decorator('baseObserver',function($delegate){
            $delegate.scroll = 'scroll';
            $delegate.headstate = 'headstate';
            $delegate.scrollHeight = 'scrollHeight';
            return $delegate;
        })
    })
})();