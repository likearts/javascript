/*
   ##############################
   ※ 백화점  라이브  전용 ( store live ) ※
   @author :  박해원
   @date : 20170904
   @last-modify :
   ##############################
*/

(function(window, angular) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteSideMylotte',
        'lotteCommFooter',
        'storeliveComm',
        'lotteSlider',
        'lotteSns'
    ]);

    app.controller('StoreLiveBrandCtrl', ['$scope', 'LotteCommon', 'storeliveApi', 'commInitData', 'storeliveService','$timeout',
        function($scope, LotteCommon, storeliveApi, commInitData, storeliveService, $timeout) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.subTitle = "　"; // 서브헤더 타이틀

        // [필수] screen type
        storeliveService.setProductKeyName('brand');

        var paramsInit = {};
        try{ for( var i in commInitData.query) paramsInit[i] = commInitData.query[i];
        } catch(e) {  }

        // 기본 데이타
        storeliveApi({
            url : LotteCommon.storliveBrandMainData,
            data :paramsInit,
            dataName : 'baseData' // Observer 네임
        }).then(loadInit,loadInit);

        storeliveService.Observers.pageloading.set(true);
        function loadInit(res){
            storeliveService.Observers.pageloading.set(false);
            // 카테고리 목록이 없으면 전체
            try{ if( !res.brnd_top.brand_category.items.length ) allCategoryList(); }
            catch(e) { allCategoryList() }
        }

        function allCategoryList () {
            $timeout(function(){
                storeliveService.Observers.category.set( {disp_no:999, elliv_shop_sn:commInitData.query.elliv_shop_sn } );
            },300);
        }

        $scope.loadingState = false;
        $scope.LotteSuperBlockStatus = false;
        storeliveService.Observers.loading.get().then( null, null, function(res){
            if( typeof res != 'boolean' ) return;
            $scope.loadingState = $scope.LotteSuperBlockStatus = res;
        });

        $scope.storeliveData = {
            goods_list: [], // 상품목록
            page : 0, // 목록 페이지
            end : false, // 풀 로드 여부
            total:0, // 총 페이지
            tag_open_state : false, // 상단 태그 열고, 닫기
            sort : 1, // 최신, 인기 ( 최신:1, 인기:2 ) 기본값이 1
            alignOptoins : [
                { name:'최신', value:1 },
                { name:'인기', value:2 }
            ],
            goods_total_count:0, // 총 상품개수
            loading : false
        };

        storeliveService.Observers.productLoading.get().then(null,null,
        function(res){
            $scope.storeliveData.loading = res;
        });
    }]);

    app.directive('lotteContainer', [ '$timeout', 'storeliveService',function($timeout,storeliveService) {
        return {
            templateUrl : '/ellotte/resources_dev/mall/storelive/storelive_brand_container.html',
            link : function( scope ) {
                $timeout(function(){
                    var sub_header = angular.element("#head_sub").scope(),
                        shead = angular.element("#head_sub"),
                        body = angular.element("body");
                    sub_header.$watch( 'sub_head_fix_is', function(v){
                        v ? shead.addClass('sub_head_fix') : shead.removeClass('sub_head_fix');
                        v ? body.addClass('fix_body_contents') : body.removeClass('fix_body_contents');
                    });
                });

                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    var info = res.brnd_top.brand_shop_detail;
                    scope.subTitle = info.brnd_nm || "　";
                });
            }
        }
    }]);

    app.directive( 'brandHeader', [ 'storeliveService', function( storeliveService ){
        return {
            restirct:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/brand/brandHead.html',
            controller : 'utilsCtrl',
            scope : {},
            link : function( scope ) {
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    scope.shop_detail = res.brnd_top.brand_shop_detail;
                })
                scope.sMaserkLikeState = false;
                scope.sMaserkLike = function(){
                    if(scope.sMaserkLikeState){
                        alert('이미 찜을 하셨습니다.');
                        return;
                    }
                    scope.shopMasterLike( scope.shop_detail ).then(function(res){
                        console.log(res);
                        scope.sMaserkLikeState = true;
                    },function(err){
                        console.log(err);
                    })
                }
                // 브랜드 목록 열기
                scope.brandListOpen = function(){
                    storeliveService.Observers.brandListState.set(true);
                }
            }
        }
    }]);

    app.directive( 'subShopInfo', [ 'storeliveService', 'storeliveTiclick', function(storeliveService,storeliveTiclick){
        return {
            restrict:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/sub/sub_shop_info.html',
            controller : 'utilsCtrl',
            scope:{},
            link : function( scope ) {
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    scope.shop_detail = res.brnd_top.brand_shop_detail;
                });
                scope.shopWishState = false;
                scope.addShop = function() {
                    if(scope.shopWishState){
                        alert( '이미 추가되었습니다.' );
                        return;
                    }
                    scope.storeWish( scope.shop_detail ).then(function(res){
                        console.log(res);
                        scope.shopWishState = true;
                    },function(err) {
                        console.log(err);
                    });
                };
                scope.kakaoShop = function(){
                    if(!scope.shop_detail.sns_shop_url_addr) return;
                }
                scope.brdNameTclck = function(){
                    getScope().sendTclick( storeliveTiclick.brand_name );
                }
                scope.called = function( n ){
                    if( !n && !scope.shop_detail.shop_ctfc_no) return;
                    location.href= "tel:"+ ( n || scope.shop_detail.shop_ctfc_no );
                }
                scope.goShop = function(){
                    //tclick : storeliveTiclick.best_shop_manager + item.brnd_no
                    getScope().sendTclick( storeliveTiclick.shop + scope.shop_detail.brnd_no );
                }
            }
        }
    }]);

    app.directive( 'talkContact', [ 'storeliveService', 'storeliveTiclick', function(storeliveService, storeliveTiclick){
        return {
            restrict:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/brand/talk_contacct.html',
            scope:{},
            link : function( scope ) {
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    scope.shop_detail = res.brnd_top.brand_shop_detail;
                });
                // 톡상담
                scope.csTalk = function() {
                    if(!scope.shop_detail.sns_shop_url_addr) return;
                    getScope().sendTclick( storeliveTiclick.sub_talk + scope.shop_detail.elliv_shop_sn );
                    // 팝업
                    if(!isApp) {
                        window.open( scope.shop_detail.sns_shop_url_addr );
                    } else {
                        openNativePopup( scope.shop_detail.brnd_nm, scope.shop_detail.sns_shop_url_addr );
                    }
                }
            }
        }
    }]);

    app.directive( 'storeLiveShopCategory',['$window', '$timeout', 'storeliveApi', 'storeliveService', 'storeliveTiclick', 'commInitData',
        function( $window, $timeout, storeliveApi, storeliveService, storeliveTiclick, commInitData ){
        return {
            restrict:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/brand/store_live_shop_category.html',
            scope: { action:'=' },
            link : function( scope ) {

                var elliv_shop_sn = commInitData.query.elliv_shop_sn;
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;

                    // 목록이 없으면 종료
                    scope.main_category_list = res.brnd_top.brand_category.items || [];
                    if( !scope.main_category_list.length ) return;

                    // 기본 전체
                    $timeout(function(){
                        storeliveService.Observers.category.set( {disp_no:999, elliv_shop_sn:commInitData.query.elliv_shop_sn } );
                        if( scope.main_category_list.length ) {
                            for( var i=0; i<scope.main_category_list.length; ++i ) {
                                scope.main_category_list[i].elliv_shop_sn=commInitData.query.elliv_shop_sn;
                                if( scope.main_category_list[i].disp_no === storeliveService.Observers.category.getValue() ){
                                    storeliveService.Observers.categoryIndex.set(i);
                                }
                            }
                        }
                    },300);
                });

                // 매장일련번호 추가
                function addBrandNo(n){
                    var c = angular.copy(n);
                    if(elliv_shop_sn) c.elliv_shop_sn = elliv_shop_sn;
                    return c;
                }

                /**
                 * 상단태그 클릭
                 * @param item
                 */
                scope.categoryTrigger = function( item ) {
                    for( var i=0; i<scope.main_category_list.length; ++i ) {
                        if(scope.main_category_list[i].disp_no == item.disp_no ) {
                            scope.categoryActive(i, item );
                            return;
                        }
                    }
                }

                /**
                 * 카테고리 클릭
                 * @param i
                 */
                scope.categoryActive = function( i ) {
                    // 중복이면 종료
                    if( typeof i == 'number' && scope.main_category_list[i].disp_select_yn == 'Y' ) return;
                    angular.forEach( scope.main_category_list, function(e){
                        e.disp_select_yn = 'N';
                    });
                    // 탭선택
                    scope.main_category_list[i].disp_select_yn = 'Y';
                    // storeliveService 업데이트
                    storeliveService.Observers.category.set( addBrandNo(scope.main_category_list[i]) );
                    storeliveService.Observers.categoryIndex.set(i);
                    getScope().sendTclick( storeliveTiclick.category + scope.main_category_list[i].disp_no );
                    if( scope.action && typeof scope.action == 'function') scope.action( scope.main_category_list[i] );
                }

            }
        }
    }]);

})(window, window.angular);