(function(){
    angular.module('routeConfig',[])
    // Router 네임
    .value('routeName', {
        home:'/',
        profile:'/profile',
        works:'/works',
        contact:'/contact'
    })
})();