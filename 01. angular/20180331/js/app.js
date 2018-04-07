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
    .controller( 'likeartsCtrl',function($scope){

    })
    .run(function(baseService,baseObserver){
        angular.element( document.querySelectorAll('.container') )
        .bind('scroll',function(e){
            baseService.getObserver(baseObserver.scroll).set(e)
        })
    })
})();

