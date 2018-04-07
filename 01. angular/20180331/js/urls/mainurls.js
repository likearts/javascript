(function(){
    angular.module('mainUrls',['apiList'])
    .config(function($provide){
        $provide.decorator('apiManager',function($delegate){
            $delegate.mainContent = "https://jsonplaceholder.typicode.com/photos";
            $delegate.mainContent1 = "https://jsonplaceholder.typicode.com/photos";
            $delegate.mainContent2 = "https://jsonplaceholder.typicode.com/photos";
            $delegate.mainContent3 = "https://jsonplaceholder.typicode.com/photos";
            $delegate.mainContent4 = "https://jsonplaceholder.typicode.com/photos";
            return $delegate;
        })
    })
})();