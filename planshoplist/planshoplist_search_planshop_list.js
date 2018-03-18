(function() {
    'use strict';

    angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteSideMylotte',
        'lotteCommFooter',
        'lotteProduct',
        'lotteNgSwipe',
        'lotteSlider',
        'angular-carousel',
        'searchPlanShop'
    ])
    .filter('pageRange', [function() {
        return function(items, page, pgsize) {
            var newItem = [];
            for(var i =0;i < items.length;i++) {
                if(page*pgsize <= i && (page+1)*pgsize > i) {
                    newItem.push(items[i]);
                }
            }
            return newItem;
        }
    }])
    .controller('searchPlanShopListCtrl', ['$scope',function($scope) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.subTitle = "모두보기"; // 서브헤더 타이틀

        $scope.curDispNoSctCd = "50";
        $scope.scrollFlag = true;
        $scope.screenID = "SrhPlanShopResult";
        $scope.isShowLoading = false;// Ajax 로드 Flag 초기화
        $scope.productListLoading = false;
        $scope.productMoreScroll = true;
        $scope.tipShow = false; //툴팁
        $scope.curSideStatus = 1; // 뒤로가기시 히스토리 기능
        $scope.templateType ="search_image_2017";
        $scope.pageLoading = true;
    }])
    .directive('lotteContainer', ['$http','prodConfig','commInitData','$window','$timeout','updatePosition','currentPage',
        function($http,prodConfig,commInitData,$window,$timeout,updatePosition,currentPage) {
        return {
            restict:'EA',
            templateUrl : '/lotte/resources_dev/search/planshoplist/search_planshop_list_container.html',
            replace : true,
            link : function(scope) {

                scope.total_count;
                scope.products = [];
                scope.postParams = commInitData.query;
                scope.postParams.page = 1;
                scope.scrollinitFixed = false;
                scope.useScrollAction = false;
                scope.hereState = true;
                scope.counting = 0;

                var fixInit = false,
                    moreType = commInitData.query.moreType||0,
                    getHere = function(){
                    return angular.element(".unitWrap .here");
                };

                currentPage = prodConfig.catchInfo[moreType];
                scope.screenID = currentPage.screenID;

                scope.getData = function(){
                    scope.productListLoading  = true;
                    $http.get(
                        currentPage.json, {params:scope.postParams})
                        .then(function(res){
                            var data = (res.data.max||res.data).prdLst;
                            if(!scope.total_count) scope.total_count = data.tcnt || data.total_count;

                            try{
                                if(!data || !data.items.length ) scope.productMoreScroll = false;
                            } catch(e) {
                                scope.productMoreScroll = false;
                                console.warn('데이터로드 종료 :' + e );
                            }

                            if(data) scope.products = scope.products.concat(data.items);
                            scope.pageLoading = false;
                            scope.productListLoading = false;

                            if(!scope.scrollinitFixed&&!fixInit) $timeout(scrollFixEnter,1500);
                        },
                        function(er){
                           console.warn('error:'+er);
                    });
                }
                var cntWatch = scope.$watch('total_count',function(n){
                    if(n) {
                        cntWatch(); //clear;
                        var title = scope.subTitle,
                            cntInterval = setInterval(function(){
                               if( scope.counting < n ) scope.counting++;
                               else clearInterval(cntInterval);
                               scope.$apply(function(){
                                   scope.subTitle = title+"("+scope.counting+")";
                               });
                        },25);
                    }
                });
                scope.getData();

                /**
                 * 스크롤 이벤트 - 더보기
                 */
                angular.element($window).on("scroll", function(e){
                    var $win = angular.element($window),
                        $body = angular.element("body"),
                        winH = $win.height(),
                        bodyH = $body[0].scrollHeight,
                        scrollRatio = 4.0; // 윈도우 높이의 4배

                    updatePosition.setPos($win.scrollTop());

                    // '여기까지 봤어요.' 비노출
                    if(scope.scrollinitFixed && scope.hereState) {
                        scope.hereState = false;
                        getHere().addClass('remove');
                        setTimeout(function(){
                            getHere().remove();
                        },1000);
                    }

                    if(!scope.scrollFlag){ e.preventDefault(); return ; }
                    if(!scope.productMoreScroll || scope.productListLoading || scope.pageLoading){ return; }
                    bodyH = $body[0].scrollHeight;

                    if($win.width() >= 640){// 그리드가 2단 이상일 경우 로드 비율을 낮춘다
                        scrollRatio = 2;// 윈도우 높이의 2배
                    }else{
                        scrollRatio = 4.0;// 윈도우 높이의 4배
                    }

                    if($win.scrollTop() + winH >= bodyH - (winH * scrollRatio)){
                        scope.loadDataParams();
                    }
                });

                /**
                 * 검색 데이터 타입별 Parameter 생성
                 */
                scope.loadDataParams = function () {
                    if (scope.isShowLoading ||
                        scope.productListLoading ||
                        angular.element(window).innerHeight() == angular.element(document).innerHeight() ) {
                        return false;// 전송 요청 중일 경우 중복 실행 방지
                    }
                    scope.postParams.page = scope.postParams.page + 1;// 페이지
                    scope.postParams.rtnType = "P";// 조회 구분값 P : 페이징으로 설정
                    scope.getData();
                }

                /**
                 * 15번 상품 위치로 이동
                 */
                function scrollFixEnter () {
                    fixInit = true;
                    var fixInterval = 0,
                        cnt = 0,
                        max = 20,
                        y = 0,
                        target,
                        h1 = angular.element("#lotteHeader").innerHeight(),
                        h2 = angular.element("#head_sub").innerHeight(),
                        space = 20;

                    fixInterval = setInterval(function(){
                        try{
                            if(!scope.scrollinitFixed) {
                                target = angular.element("[product-container] ol>li").children()[14];
                                y = angular.element(target).offset().top;
                                window.scrollTo(0, y - (h1 + h2) - space);
                                getHere().css({display: 'block', top: y - (h1 + h2) - (space + 5)});
                            }
                        }
                        catch(e) { y = 0; }

                        if( cnt<max && !scope.scrollinitFixed ) cnt++;
                        else { // .1초 한번씩 총 'max'번 실행이 끝났으면 종료 ( 페이지 진입후 강제 top으로 가는 경우에 있어 추가함 )
                            $timeout(function(){ scope.scrollinitFixed = true }, 1000 ); // '여기까지봤어요' 1초 후 스크롤시 사라짐
                            clearInterval(fixInterval);
                        }
                    },10);
                }

                /**
                 * 사용자가 15번 상품 위치로 스크롤 이동전
                 * 스크롤를 50이상 이동시 '여기까지 봤어요' 표시안함
                 */
                var touchY = 0;
                angular.element($window).bind('touchstart.plan touchmove.plan touchend.plan',
                function(e){
                    switch(e.type) {
                        case "touchstart":
                            touchY = e.originalEvent.changedTouches[0].clientY;
                        break;
                        case "touchmove":
                            if( !scope.scrollinitFixed && Math.abs(touchY - e.originalEvent.changedTouches[0].clientY) > 50 ){
                                scope.scrollinitFixed = true;
                                angular.element($window).unbind('touchstart.plan touchmove.plan touchend.plan');
                            }
                        break;
                    }
                })
            }
        };
    }])
    /**
     * @ngdoc directive
     * @name lazyShow
     * @description
     *  - 유닛이 화면에 들어올때 보여주기
     */
    .directive('lazyShow',['updatePosition',function(updatePosition){
        return function(scope,el){
            var intY = el.offset().top,
                footh = angular.element("#lotteActionbar").innerHeight() || 50,
                wh = window.innerHeight;
            updatePosition.updateState().then(null,null,function(res){
                scope.isLayShow( res );
            });
            scope.isLayShow = function(n){
                if( !el.hasClass('is_show') && n > intY-(wh-footh) ) el.addClass('is_show');
            };
            scope.isLayShow(updatePosition.getPos());
        }
    }])
    /**
     * @gndoc service
     * @name updatePosition
     * @description
     *  - scroll값 갱신용
     */
    .service('updatePosition',['$q',function($q){
        this.defer = $q.defer();
        this._pos = 0;
        this.setPos = function(n){
            this._pos = 0;
            this.defer.notify(n);
        }
        this.getPos = function(){
            return this._pos;
        }
        this.updateState = function(){
            return this.defer.promise;
        }
    }])
    /**
     * @ngdoc config
     * @description
     * - 파라미터 설정 변경
     */
    .config(['prodConfigProvider','LotteCommonProvider',function(prodConfigProvider,LotteCommonProvider){
        for( var i=0; i<prodConfigProvider.$get().catchInfo.length;++i ){
            // 공통 변경
            prodConfigProvider.$get().catchInfo[i].hideParams=[]
            prodConfigProvider.$get().catchInfo[i].page=LotteCommonProvider.$get().searchPanShopList;
            // i:( resources_dev/search/products/planshop/planshop_list.js -> prodConfig -> moreType) | 0:검색, 1:카테
            prodConfigProvider.$get().catchInfo[i].necessaryParams={
                cmpsCd:30,
                sort: i ? 'TOT_ORD_CNT,1' : 'RANK,1'
            };
        }
    }])

})();