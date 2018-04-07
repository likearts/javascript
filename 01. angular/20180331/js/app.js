(function(){
    'use strict'
    angular.module('likearts', [
        'ngRoute',
        'routeList',
        'gnb',
        'layout',
        'baseModel',
        'home'
    ])
    .controller( 'likeartsCtrl',function($scope,$rootScope,$route,routeName,baseService,baseObserver){
        baseService.obsList.list[baseObserver.scroll].getDefer()
        .then(null,null,function(e){
            baseService.obsList.list[baseObserver.headstate].set( e.target.scrollTop ? true : false );
        })
    })
    .config(function($provide){
        $provide.decorator('baseObserver',function($delegate){
            $delegate.scroll = 'scroll';
            $delegate.headstate = 'headstate';
            return $delegate;
        })
    })
    .run(function(baseService,baseObserver){
        angular.element( document.querySelectorAll('.container') )
        .bind('scroll',function(e){
            baseService.obsList.list[baseObserver.scroll].set(e)
        })
    })
})();

