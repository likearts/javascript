(function(){
    'use strict'

    angular.module('likearts',['ngRoute','ngAnimate'])

    // Router 네임
    .value('routeName', {
        home:'/',
        profile:'/profile',
        works:'/works',
        contact:'/contact'
    })

    // Router 페이지 설정
    .config(function($routeProvider,routeNameProvider){
        $routeProvider
        .when(routeNameProvider.$get().home,{
            templateUrl : 'pages/home.html',
            controller:'',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get().profile,{
            templateUrl : 'pages/profile.html',
            controller:'',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get().works,{
            templateUrl : 'pages/works.html',
            controller:'worksCtrl',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get().contact,{
            templateUrl : 'pages/contact.html',
            controller:'',
            access: {
                isFree: true
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    })

    .controller( 'likeartsCtrl',function($scope,$rootScope,$location,routeName,$route){
        $scope.routeName = routeName;

        $scope.HomeFragmentController = function($scope) {
            $scope.$on("$routeChangeSuccess", function(scope,next,current) {
                console.log('success');
                $scope.transitionState = "active";
            });
        }

        $rootScope.$on('$locationChangeStart',
        function(event, currRoute, prevRoute){ // currRoute:현재 페이지 URL, prevRoute:이전 페이지 URL
            angular.forEach($route.routes, function (value, key) {
               console.log('value',value);
            });
            // 페이지 경로
            console.log('page', $location.$$path);
            $scope.pageName = $location.$$path;
            // 넘어온 파라미터
            console.log('params', $location.search());
        })
    })

    // works 페이지 controller
    .controller('worksCtrl',function($scope){
        console.log('-- worksCtrl!!')
    })

})();

