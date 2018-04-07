(function(){
    angular.module('mainUrls',['apiList'])
    .config(function($provide){
        $provide.decorator('apiManager',function($delegate){
            $delegate.mainContent = "https://jsonplaceholder.typicode.com/photos";
            return $delegate;
        })
    })
})();