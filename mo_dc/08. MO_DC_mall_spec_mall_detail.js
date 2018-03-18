/**
 * @Autor 박해원
 * @date 20171212
 * 
 * @ngdoc module
 * @description
 *  - 전문몰 핀터레스트 상세페이
 */
(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteSideMylotte',
        'lotteCommFooter',
        'specMallCate',
        'lotteSns',
        'hwSwipe'
    ]);

    /**
     * @ngdoc factory
     * @name api
     * @description
     * - 로더
     */
    app.factory( 'api', ['$http','LotteCommon','commInitData',
    function($http,LotteCommon,commInitData){
        return function(){
            return $http({
                url:LotteCommon.specMallDetailData,
                params:{
                    dispNo:commInitData.query.dispNo,
                    ptrNo:commInitData.query.ptrNo
                },
                method:'get'
            });
        }
    }])

    /**
     * @ngdoc factory
     * @name dataFilter
     * @description
     * - 데이터 필터
     */
    app.factory( 'dataFilter', [function(){
        return function(data){
            if( !data.logo ) data.logo = {}
            if( !data.related_prd ) data.related_prd = 0;
            if( !data.banners || !data.banners.items ) data.banners={items:[]}
            return data;
        }
    }])

    /**
     * @ngdoc controller
     * @name specMalldetailCtrl
     * @description
     * - 핀터레스트 상세 컨트롤러
     */
    app.controller('specMalldetailCtrl', ['$scope', 'LotteCommon','commInitData','$timeout','api','dataFilter',
    function($scope, LotteCommon, commInitData, $timeout, api, dataFilter) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.isShowThisSns = true;

        function loadCompleted(res){
            $scope.bindData = dataFilter(res.kShop);
            if($scope.bindData.logo.imgUrl) {
                var addstyle = 'width:180px !important; height:25px !important; color:transparent !important; background:url('+$scope.bindData.logo.imgUrl+') center center no-repeat !important; background-size:auto 100% !important';
                document.styleSheets[0].addRule( '#head_sub h2 span span', addstyle );
            } else {
                var addstyle = 'width:180px !important; height:25px !important; color:#000 !important; background:url('+$scope.bindData.logo.imgUrl+') center center no-repeat !important; background-size:auto 100% !important';
                document.styleSheets[0].addRule( '#head_sub h2 span span', addstyle );
            }
            // 공유 이미지
            $scope.share_img = $scope.bindData.banners.items[0].imgUrl;
            $scope.share_path = location.href;
        }

        function loadError(e){
            console.log('[error] '+e )
        }

        /*UI Scope*/
        $scope.kShopUI = {
            dispNo : commInitData.query.dispNo,  // 매장번호, KShop : 5535841,  빅사이즈 : 5550543
            ptrNo : commInitData.query.ptrNo
        };
        $scope.addCls = "spec"+$scope.kShopUI.dispNo; //서브헤더 타이틀 유동적 처리
        $scope.curDispNo = $scope.kShopUI.dispNo; // lotte_product 링크 params
        $scope.curDispNoSctCd = ""; // 상세 유입코드

        // 연관상품 페이지로 이동
        $scope.goProduct = function(){
            var URL = LotteCommon.specMallDetailProducts+"?"+baseParam;
            URL+="&dispNo="+$scope.kShopUI.dispNo+"&ptrNo="+$scope.kShopUI.ptrNo;
            location.href=URL;
        }

        // 전문몰 메인으로
        $scope.goKshopMain = function(){
            if(!$scope.kShopUI.dispNo) return;
            var url = LotteCommon.specialMallUrl+"?"+baseParam+"&dispNo="+$scope.kShopUI.dispNo;
            location.href = url;
        }
        var titleWatch = $scope.$watch( 'subTitle', function(res){
            if(!res) return;
            titleWatch();
            $timeout(function(){
                var subheadLink = angular.element("#head_sub h2 span.title"),
                    shareBtn = angular.element("#head_sub p > a");
                subheadLink.attr('onclick','angular.element(this).scope().goKshopMain()');
                shareBtn.attr('onclick','angular.element(this).scope().shareAfterAction()');
            },400);
        })

        $scope.ptrLink = function(link){
            try{ if(!link || link.indexOf('/') < 0 ) return } catch(e) {}
            location.href = link;
        }

        $scope.shareAfterAction = function() {
            $timeout(function () {
                getScope().noCdnUrl = location.href;
            }, 300);
        }

        api().success(loadCompleted).error(loadError);
    }]);

    /**
     * @ngdoc directive
     * @name lotteContainer
     * @description
     * - 컨텐츠 페이지
     */
    app.directive('lotteContainer', [function() {
        return {
            templateUrl : '/lotte/resources_dev/mall/spec_mall_detail_container.html',
            replace : true,
            link : function(scope) {
                scope.goProductList = function(){

                }
            }
        };
    }]);

})(window, window.angular);