/**
 * @author : 박해원
 * @date : 20180306
 *
 * @ngdoc : Module
 * @name : searchPlanShop
 * @description
 *  - 기획전형 상품 목록
 *  - 기본설정 페이지 : 검색 목록 페이지, 카테고리 상품목록
 *    config로 추가 페이지 등록 가능
 */
(function(){
    angular.module('searchPlanShop',['hwSwipe','lotteComm'])
    .value('currentPage',{})
    /**
     * @ngdoc constant
     * @name observers
     * @description
     * - observer 목록
     */
    .constant('observers',{
        request:'request',
        response:'response'
    })
    /**
     * @ngdoc provider
     * @name prodConfig
     * @description
     *  - responseParams : 기획전형 강제 노출 파라미터 설정 { false : null, true : not null }
     *  - catchInfo :
     *      necessaryParams : 데이터 로드시 필수 추가 파라미터
     *      hideParams : 설정된 파라미터 값이 있을경우 기획전형 상품 비노출
     *      page : 체크할 페이지
     *      json : 체크된 페이지의 데이터 URL,
     *      screenID : 상품 티클릭,
     *      moreType : 0:검색, 1:카테 ( '모두보기' 페이지에서 사용 )
     */
    .provider('prodConfig',['LotteCommonProvider',function(LotteCommonProvider){
       var urlSvc = LotteCommonProvider.$get(),
           config = {
           responseParams: {},
           // 카테고리 상품목록, 검색결과 목록
           catchInfo : [{
               page: urlSvc['searchUrl'],
               json: urlSvc['srhListData2016'],
               necessaryParams: {
                   cmpsCd:50
               },
               hideParams : [
                   'ctgDepth3',
                   'ctgNo',
                   'dsCtgDepth',
                   'brdNo',
                   'ctgDepth1',
                   'ctgDepth2',
                   'ctgDepth3',
                   'ctgDepth4',
                   'ctgDepth5',
                   'priceMaxU',
                   'priceMinU',
                   'freeInstYN',
                   'pointYN',
                   'smpickYN',
                   'isDlvQuick',
                   'colorCd',
                   'freeDeliYN',
                   'deptYN',
                   'tvhomeYN',
                   'brdstoreYN',
                   'pkgYN',
                   'freeInstYN'
               ],
               screenID:'SrhResult',
               moreType:0
           },
           {
               page: urlSvc['categoryUrl'],
               json: urlSvc['cateListData2016'],
               necessaryParams: {
                   cmpsCd:50
               },
               hideParams : [
                   'ctgDepth3',
                   'ctgNo',
                   'dsCtgDepth',
                   'brdNo',
                   'ctgDepth1',
                   'ctgDepth2',
                   'ctgDepth3',
                   'ctgDepth4',
                   'ctgDepth5',
                   'priceMaxU',
                   'priceMinU',
                   'freeInstYN',
                   'pointYN',
                   'smpickYN',
                   'isDlvQuick',
                   'colorCd',
                   'freeDeliYN',
                   'deptYN',
                   'keyword',
                   'tvhomeYN',
                   'brdstoreYN',
                   'pkgYN',
                   'freeInstYN'
               ],
               screenID:'side_cate_catesmall',
               moreType:1
           }]
       };
       return {
           setResponseParams:function(param){
                if( typeof param === 'object' ) config.responseParams = angular.extend( param, config.responseParams );
           },
           setCatchInfo:function(options){
                if( typeof options === 'object' ) {
                    options.page = urls[options.page];
                    options.json = urls[options.json];
                    config.catchInfo.push(options);
                }
           },
           $get: function(){
               return config;
           }
       }
    }])
    /**
     * @ngdoc factory
     * @name catchFilter
     * @description
     *  - $http url filter
     *  - 기획전형 상품이 노출 될 페이지와 데이터 URL 체크
     */
    .factory('catchFilter', ['prodConfig', 'LotteCommon', 'searchPlanShopService', 'observers',
        function(prodConfig, LotteCommon, searchPlanShopService, observers){
        var config = {
            permit: prodConfig.catchInfo,
            URLFilter: function(url){
                var addParmas = null;
                for( var i in config.permit ) {
                    if( config.permit[i].page.indexOf(location.pathname) !== -1 &&
                        url.indexOf(config.permit[i].json) != -1 ) {
                        if(!searchPlanShopService.getCurrPage().json) searchPlanShopService.setCurrPage(config.permit[i]);
                        addParmas = angular.copy(config.permit[i].necessaryParams);
                    }
                }
                return addParmas;
            },
            ParamsFilter: function( params ){
                var exit = false;
                if(!params) params = {};
                if(params.page===1) { // 노출 상태 변경은 page가 1일 경우에만
                    for(var i in params) {
                        // 파라미터 체크
                        for( var s in searchPlanShopService.getCurrPage().hideParams ){
                            if( i === searchPlanShopService.getCurrPage().hideParams[s] && params[i] ) {
                                searchPlanShopService.visibleState.set(true);
                                exit = true;
                                break;
                            }
                            else searchPlanShopService.visibleState.set(false);
                        }
                        // 강제노출 값 체크
                        if(searchPlanShopService.visibleState.get()) {
                            for (var j in prodConfig.responseParams) {
                                if (i === j && ( (!prodConfig.responseParams[j] && !params[i]) || (prodConfig.responseParams[j] && params[i]) )) {
                                    searchPlanShopService.visibleState.set(false);
                                    exit = true;
                                    break;
                                }
                            }
                        }
                        if(exit) break;
                    }
                }
                return searchPlanShopService.visibleState.get();
            },
            request : function(res){
                return config.URLFilter(res.url);
            },
            response: function(res){
                if( config.URLFilter(res.config.url) ) {
                    searchPlanShopService.promiseList[observers.response].set({
                        data: res.data,
                        visible: config.ParamsFilter(res.config.params)
                    });
                }
            }
        }
        return config;
    }])
    /**
     * @ngdoc factory
     * @name httpInterceptor
     * @description
     *  - $Http event
     */
    .factory('httpInterceptor', ['$q','catchFilter',
        function ($q,catchFilter ) {
        return {
            request: function (config) {
                var appendParam = catchFilter.request(config);
                if(appendParam){ // 필수 파라미터 추가
                    if(!config.params) config.params = {};
                    config.params = angular.extend( appendParam, config.params );
                }
                return config || $q.when(config);
            },
            response: function (response) {
                catchFilter.response(response);
                return response || $q.when(response);
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            responseError: function (rejection) {
                return $q.reject(rejection);
            }
        };
    }])
    /**
     * @ngdoc directive
     * @name searchPlanShop
     * @description
     *  - 기획전형 상품
     */
    .directive('searchPlanShop',['searchPlanShopService','observers','LotteCommon',
        function(searchPlanShopService,observers,LotteCommon){
        return {
            restrict:'EA',
            scope:true,
            replace:true,
            templateUrl: "/lotte/resources_dev/search/products/planshop/planshop_list.html",
            link:function(scope){
                console.log('directive:searchPlanShop');
                var params = location.search;
                scope.visiblity = false;
                scope.planShopData = [];
                searchPlanShopService.promiseList[observers.response].get()
                .then(null,null,function(res){
                    scope.visiblity = res.visible;
                    var data = res.data.max || res.data;
                    try{
                        if(data.planPrdLst.items) scope.planShopData = data.planPrdLst.items;
                    } catch(e){
                        if(res.visible) scope.planShopData = [];
                        console.log('[planshop_list] : 데이터 없음');
                    }
                });
                scope.more=function(){
                    if( params.indexOf('moreType') === -1 ) params += "&moreType="+searchPlanShopService.getCurrPage().moreType;
                    location.href=LotteCommon.searchPanShopList+params;
                }

                /**
                 * 기획전 상품 링크는 분리전 처럼 lotte-product 링크를 태움
                 * @param item
                 */
                scope.planProductsLink = function(item){
                    try{ angular.element("[product-container]").children().scope().productInfoClick(item) }
                    catch(e){
                        console.log('페이지내에 lotte-product가 없음');
                    }
                }
            }
        }
    }])
    /**
     * @ngdoc service
     * @name searchPlanShopService
     * @description
     *  - observer response 전용
     */
    .service('searchPlanShopService',['$q','currentPage',function($q,currentPage){
        this.promiseList = { };
        this.addPromise = function( observerName ) {
            var self = this;
            if(self.promiseList[observerName]) return;
            var obs = self.promiseList[observerName]={},
                defer = $q.defer();

            obs['defer'] = defer;
            obs['notify'] = defer.notify;
            obs.get = function(){
                return defer.promise;
            }
            obs.set = function(data){
                defer.notify(data)
            }
        }
        this.visibleState = {
            state : false,
            set : function( state ){
                console.log('plan product state', state );
                this.state = state;
            },
            get : function( ) {
                return this.state;
            }
        }
        this.setCurrPage = function(config){ currentPage = config };
        this.getCurrPage = function(){ return currentPage }
    }])
    /**
     * @ngdoc config
     * @description
     *  - $http이벤트 및 기획전형 영역 비 노출 파라미터 설정
     */
    .config(['$httpProvider','prodConfigProvider',
        function($httpProvider,prodConfigProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
            prodConfigProvider.setResponseParams( {rtnType:false} );

            /*
                @추가시
                prodConfigProvider.setCatchInfo( {
                    page : 'specialMallUrl', <-- svc url변수명을 string으로
                    json : 'specialSubUrl', <-- svc url변수명을 string으로
                    necessaryParams: {},
                    hideParams : []
                });

                @다른 모듈에서 추가시
                angular.module('app',['searchPlanShop'])
                .config(['prodConfigProvider,function(prodConfigProvider){
                    prodConfigProvider.setCatchInfo( {
                        page : 'specialMallUrl', <-- svc url변수명을 string으로
                        json : 'specialSubUrl', <-- svc url변수명을 string으로
                        necessaryParams: {},
                        hideParams : []
                    });
                }]);
             */
        }
    ])
    /**
     * @ngdoc run
     * @description
     *  - observer 등록
     */
    .run(['observers','searchPlanShopService',
        function(observers,searchPlanShopService){
        if(!observers) return;
        for( var i in observers ) searchPlanShopService.addPromise(observers[i]);
    }])

})();