(function(){
    'use strict'

    angular.module('likearts',['ui.router','ngAnimate'])

    .provider('stateUrls',function(){
        const info = {
            home:{
                name:'home',
                url:'/',
                templateUrl:'pages/home.html',
                controller:''
            },
            profile:{
                name:'profile',
                url:'/profile',
                templateUrl:'pages/profile.html',
                controller:''
            },
            works:{
                name:'works',
                url:'/works',
                templateUrl:'pages/works.html',
                controller:'worksCtrl'
            },
            contact:{
                name:'contact',
                url:'/contact',
                templateUrl:'pages/contact.html',
                controller:''
            }
        }
        return {
            $get:function(){
                return info;
            }
        }
    })

    .config(function($stateProvider,stateUrlsProvider,$transitionsProvider,$urlRouterProvider){
        let state = stateUrlsProvider.$get(), trs = $transitionsProvider.$get();
        for( var i in state ) $stateProvider.state(state[i])

        trs.onStart({},function($transitions){
            console.log('start');
        })
        trs.onEnter({},function($transitions){
            console.log('onEnter');
        })
        trs.onBefore({},function($transitions){
            console.log('onBefore');
        })
        trs.onCreate({},function($transitions){
            console.log('onCreate',$transitions);
        })
        trs.onSuccess({}, function($transitions){
            var newToState = $transitions.$to();
            console.log(newToState);
        })

        $urlRouterProvider.otherwise("/");

    })

    .controller( 'likeartsCtrl',function($scope,$state,stateUrls){
        $scope.route = stateUrls;

        //console.log('$state',stateUrls);
        $scope.HomeFragmentController = function($scope) {
            $scope.$on("$routeChangeSuccess", function(scope,next,current) {
                console.log('success');
                $scope.transitionState = "active";
            });
        }

    })

    // works 페이지 controller
        .controller('worksCtrl',function($scope){
            console.log('-- worksCtrl!!')
        })

})();