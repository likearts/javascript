(function(){
    angular.module('layout',['baseModel'])
    .directive('lkHead',function(baseService,baseObserver){
        return {
            scope:true,
            restrict:'EA',
            templateUrl:'/inc/head.html',
            //template:'<div>head</div>',
            link : function(scope){
                baseService.getObserver(baseObserver.headstate).getDefer()
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
            baseService.getObserver(baseObserver.headstate).getDefer()
            .then(null,null,function(state){
                scope.headState = state;
            })
            baseService.getObserver(baseObserver.scrollHeight).set(0);
            scope.$watch(function(){
                return el[0].scrollHeight;
            },function(n,o){
                if(!n||n==o||n===undefined) return;
                baseService.getObserver(baseObserver.scrollHeight).set(n);
            })
        }
    })
    .directive('loading',function(baseService,baseObserver){
        return {
            scope:true,
            restrict:'EA',
            templateUrl:'/inc/loading.html',
            link:function(scope){
                scope.loadingState = false;
                baseService.getObserver(baseObserver.loading).getDefer().then(null,null,function(state){
                    scope.loadingState = state;
                })
            }
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
    .run(function(baseService,baseObserver){
        baseService.getObserver(baseObserver.scroll).getDefer()
            .then(null,null,function(e){
                baseService.getObserver(baseObserver.headstate).set( e.target.scrollTop ? true : false );
            })
    })
})();