var menuSlide = null; /*슬라이드 Plug-in*/

(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteCommFooter',
        'lotteUnit',
        'lotteNgSwipe',
        'elshopCategory'
    ]);

    app.controller('ElshopSpecMallCtrl', ['$http', '$scope', 'LotteCommon', 'commInitData', 'LotteUtil', '$location','$window','$timeout', function($http, $scope, LotteCommon, commInitData, LotteUtil, $location,$window, $timeout) {
        $scope.showWrap = true;
        $scope.contVisible = true;

        $scope.elShop = {
            dispNo : commInitData.query.dispNo,
            curDispNo : "",
            stgCheck:false
        };

        // 로컬 테스트
        $scope.elShop.stgCheck = window.location.href.indexOf("mo.lotte.com") > -1 ? true : false;

        /* 카테고리 1/2 그룹 만들기 */
        var nCatArr =
        {
            getSubList : function(arr)
            {
                var n = [],
                    max = Math.ceil( arr.length/2 ),
                    v = 2;
                for(var i=0;i<max;++i){
                    var sliceArr=[];
                    for(var s=0;s<v;++s) {
                        var c = i*v+s;
                        if( arr[c] ) {
                            arr[c].depthIndex = c;
                            arr[c].groupIndex = i;
                            arr[c].subIndex = s;
                            sliceArr.push( arr[c] );
                        }
                    }
                    if(sliceArr.length) n.push({s:sliceArr});
                }
                return n;
            },
            setCatData : function( data )
            {
                var n = JSON.parse(JSON.stringify(data));
                for( var i=0; i<data.length; ++i ) {
                    if( data[i].sub_cate_list&&data[i].sub_cate_list.length ) {
                        /* 3depth
                        for(var s=0;s<data[i].sub_cate_list.length;++s){
                            if(data[i].sub_cate_list[s].sub_cate_list&&data[i].sub_cate_list[s].sub_cate_list.length){
                                n[i].sub_cate_list[s].sub_cate_list = nCatArr.getSubList( data[i].sub_cate_list );
                            }
                        }
                        */
                        n[i].depthIndex=i;
                        n[i].sub_cate_list = nCatArr.getSubList( data[i].sub_cate_list );
                    }
                }
                return n;
            }
        }

         /* 페이지연결 */
        $scope.randingURL = function( url, tclick ) {
            console.log( 'url', url );
        }

        /**
         * Data Load Scope Func
         */
        $scope.loadCtgData = function () {
            if ($scope.ctgData == undefined) {
                $http.get(LotteCommon.specMallMainData, {
                    withCredentials:false,
                    params: {dispNo:$scope.elShop.dispNo}
                })
                .success(function(data) {
                    $scope.ctgData = data;
                    $scope.subTitle = data.disp_nm;
                    $scope.tclickCode = data.elshopMain.disp_lrg_no;
                    $scope.subTitle = "전문관";
                    // 카테고리
                    $scope.catData = nCatArr.setCatData( data.elshopMain.cate_list.items );
                    console.log('cdata',$scope.catData);

                    $scope.dataLoadInit();
                })
                .error(function () {
                    console.log('Data Error : 전문몰 데이터' );
                });
            }
        };

        // 데이타로드
        $scope.loadCtgData();
    }]);

    app.directive('elshopContainer', ['$window', '$timeout', '$location', function($window, $timeout, $location) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/elshop_spec_mall_container.html',
            replace:true,
            link: function (scope,  el, attrs)
            {
                var $win = angular.element($window);

                function initHead(){
                    var headData = scope.ctgData.elshopMain.mainTitleImgBanner;
                    scope.subTitle = headData.img_url ? "<img src='"+headData.img_url+"' alt='"+headData.alt_cont+"'/>" :
                    headData.banner_nm;
                }

                function initTopBanner () {
                    var bnnData = scope.ctgData.elshopMain.mainTopABanners.items || [],
                        applyData = null;
                    applyData = bnnData.length ?
                    { type:'A', data:scope.ctgData.elshopMain.mainTopABanners.items || [] } :
                    { type:'B', data:scope.ctgData.elshopMain.mainTopBBanners.items || [] };
                    scope.alias.topBann.type = applyData.type;
                    scope.alias.topBann.data = applyData.data;
                }

                scope.dataLoadInit = function()
                {
                    initHead();
                    initTopBanner();

                    // 브랜드배너
                    scope.alias.brandBnn.data = scope.ctgData.elshopMain.mainBrandBanners.items;
                    // 금주 신상품
                    scope.alias.newProduct.data = scope.ctgData.elshopMain.mainNewProdBanners.items;
                    // 기획전
                    scope.alias.planShop.data = scope.ctgData.elshopMain.mainPlanshopBanners.items;
                    // hot한 신상품
                    scope.alias.newHotProduct.data = scope.ctgData.elshopMain.mainNewHotProdBanners.items;
                    // 핫 이슈 상품
                    scope.alias.hotIssue.title = scope.ctgData.elshopMain.mainHotIssueTitleBanners;
                    scope.alias.hotIssue.data = scope.ctgData.elshopMain.mainHotIssueBanners.items;
                    // 플러스 딜
                    scope.alias.plusDeal.data = scope.ctgData.elshopMain.mainDealPopularBanners.items;
                    // 완벽한 스타일
                    scope.alias.mdTip.data = scope.ctgData.elshopMain.mainMdTipBanners.items;
                    // 특별한 이야기
                    scope.alias.specialStory.data = scope.ctgData.elshopMain.mainSpecStoryBanners.items;
                    // 공지사항
                    scope.alias.notice.data = scope.ctgData.elshopMain.mainNoticeTextBanners.items;
                }

                var dataObjectList = [
                    "topBann",
                    "brandBnn",
                    "newProduct",
                    "planShop",
                    "newHotProduct",
                    "hotIssue",
                    "plusDeal",
                    "mdTip",
                    "specialStory",
                    "notice"
                  ], alias = {};

                function dataObjectController ( name ) {
                    alias[name] = {
                        swipeIndex : 0,
                        swipeControl : null,
                        data : null,
                        setControl : function(ctrl){
                            scope.alias[name].swipeControl = ctrl;
                        },
                        endFunc : function(e){
                            scope.alias[name].swipeIndex = e;
                        }
                    }
                }
                for( var i in dataObjectList ) dataObjectController( dataObjectList[i] );
                scope.alias = alias;
            }
        };
    }]);

    app.directive('elshopNotice', [function ($timeout, $location) {
        return {
            link: function (scope, el, attrs)
            {
                scope.chnageNotice = function( str ){
                    var n = scope.alias.notice,
                        i = n.swipeIndex,
                        m = n.data.length;
                    if( str == "up" ) {
                      if( i<m-1 ) i++; else i = 0;
                    } else {
                      if( i> 0 ) i--; else i = m-1;
                    }
                    scope.alias.notice.swipeIndex = i;
                }
                scope.noticeRollng = function(){
                  setTimeout(function(){ scope.chnageNotice("up"); scope.noticeRollng() }, 5000 );
                }
                if(scope.noticeRollng) scope.noticeRollng();
            }
        };
    }]);

    app.filter('htmlRemove', [function() {
        return function(text) {
            return text.substr(0,17);
        }
    }]);

})(window, window.angular);
