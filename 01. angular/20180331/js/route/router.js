(function(){
    angular.module('routeList',['routeConfig'])

    // Router 페이지 설정
    .config(function($routeProvider,routeNameProvider){

        $routeProvider
        .when(routeNameProvider.$get().home,{
            templateUrl : 'template/home.html',
            controller:'homeCtrl'
        })
        .when(routeNameProvider.$get().profile,{
            templateUrl : 'template/profile.html',
            controller:''
        })
        .when(routeNameProvider.$get().works,{
            templateUrl : 'template/works.html',
            controller:''
        })
        .when(routeNameProvider.$get().contact,{
            templateUrl : 'template/contact.html',
            controller:''
        })
        .otherwise({
            redirectTo: '/'
        })

    })
})();