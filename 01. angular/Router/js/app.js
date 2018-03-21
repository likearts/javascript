(function(){
    'use strict'

    angular.module('likearts',['ngRoute','ngAnimate'])

    // Router 네임
    .value('routeName',[
        '/',
        '/profile',
        '/works',
        '/contact'
    ])

    // Router 페이지 설정
    .config(function($routeProvider,routeNameProvider){
        $routeProvider
        .when(routeNameProvider.$get()[0],{
            templateUrl : 'pages/home.html',
            controller:'',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get()[1],{
            templateUrl : 'pages/profile.html',
            controller:'',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get()[2],{
            templateUrl : 'pages/works.html',
            controller:'worksCtrl',
            access: {
                isFree: true
            }
        })
        .when(routeNameProvider.$get()[3],{
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

    .controller( 'likeartsCtrl',function($scope,$rootScope,$location,routeName){

        // 현재 페이지 메뉴 컬러 변경
        $scope.page = 1;
        $scope.gnbActive = function(name){
            for( var i in routeName ) if( routeName[i] === name ) { $scope.page=Number(i)+1; break }
        }

        $scope.HomeFragmentController = function($scope) {
            console.log('HomeFragmentController')
            $scope.$on("$routeChangeSuccess", function (scope, next, current) {
                $scope.transitionState = "active";
            });
        }

        $rootScope.$on('$locationChangeStart',
        function(event, currRoute, prevRoute){ // currRoute:현재 페이지 URL, prevRoute:이전 페이지 URL
            // 페이지 경로
            console.log('page', $location.$$path);
            $scope.gnbActive($location.$$path);
            // 넘어온 파라미터
            console.log('params', $location.search());
        })

    })

    // works 페이지 controller
    .controller('worksCtrl',function($scope){
        console.log('-- worksCtrl!!')
    })

})();

