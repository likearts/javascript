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
        'lotteSns'
    ]);

    app.controller('storeLiveCtrl', ['$rootScope','$scope', 'LotteCommon', 'storeliveApi', 'commInitData', 'storeliveService', '$timeout',
        function($rootScope, $scope, LotteCommon, storeliveApi, commInitData, storeliveService, $timeout ) {
        $scope.showWrap = true;
        $scope.contVisible = true;

        storeliveService.setProductKeyName( 'sub' );

        var paramsInit = {};
        try{ for( var i in commInitData.query) paramsInit[i] = commInitData.query[i];
        } catch(e) {}

        storeliveApi({
            url : LotteCommon.storliveSubMainData,
            data : paramsInit,
            dataName :'baseData'
        }).then(loadInit,loadInit);

        storeliveService.Observers.pageloading.set(true);

        function loadInit(){
            storeliveService.Observers.pageloading.set(false);
        }

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

        $timeout( function(){
            storeliveService.Observers.category.set({
                disp_no:commInitData.query.cate_no,
                elliv_shop_sn:commInitData.query.elliv_shop_sn
            });
        },500);

        storeliveService.Observers.productLoading.get().then(null,null,
        function(res){
            $scope.storeliveData.loading = res;
        });

        window.onoload = function(){
            try{ angular.element("#lotteActionbar").remove() }
            catch(e){}
        }

        // 스크롤탑 2.5초 동안 강제 고정 20171026
        var cnt = 0,
            cntMax = 5,
            topInterval = setInterval( function(){
                var scTop = window.scrollY;;
                if( scTop > 0 && scTop < 10 ) window.scrollTo(0,0);
                if( cnt >=cntMax || scTop>= 10 ) clearInterval(topInterval);
                cnt++;
        },500);
    }]);

    app.directive('lotteContainer', ['$timeout', function($timeout) {
        return {
            templateUrl : '/ellotte/resources_dev/mall/storelive/storelive_container.html',
            link : function( scope ) {
                $timeout(function(){
                    var sub_header = angular.element("#head_sub").scope(),
                        shead = angular.element("#head_sub"),
                        body = angular.element("body");
                    sub_header.$watch( 'sub_head_fix_is', function(v){
                        v ? shead.addClass('sub_head_fix') : shead.removeClass('sub_head_fix');
                        v ? body.addClass('fix_body_contents') : body.removeClass('fix_body_contents');
                    })
                });
            }
        }
    }]);
    
    app.directive( 'subDetailHeader', [ '$timeout', 'storeliveService', 'goodsWish', 'storeliveTiclick', 'productLink', 'LotteCommon',
        function($timeout,storeliveService, goodsWish, storeliveTiclick, productLink, LotteCommon){
        return {
            restrict:'E',
            controller : 'utilsCtrl',
            templateUrl : '/ellotte/resources_dev/mall/storelive/sub/sub_head.html',
            scope:{},
            link : function( scope, el, attrs, ctrl ) {
                var head_h = angular.element('#head')[0].clientHeight,
                    foot_h = angular.element('#lotteActionbar')[0].clientHeight,
                    imghs = [],
                    error_height = 100000,
                    resize = function() {
                        return { width: window.innerWidth, height: window.innerHeight };
                    },
                    w = resize().width;

                scope.hold_img_height = 0;
                scope.detail_image_loading = true;
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    //console.log( '[subDetailHeader] initData', res );
                    scope.sub_head_data = res.sub_top.goods_detail;
                    scope.goods_img_list = res.sub_top.goods_img_list.items;
                    scope.shop_kakao = res.sub_top.shop_detail.sns_shop_url_addr;
                    scope.shopTel = res.sub_top.shop_detail.shop_ctfc_no;
                    scope.tclickCode = "m_Ek_ekDeptLive_Brd_prd_"+scope.sub_head_data.goods_no+"_Clk_Shr";
                    scope.kakaoPlusFriendUrl = res.sub_top.shop_detail.sns_shop_url_addr;

                    getScope().subTitle = res.sub_top.shop_detail.brnd_nm || "　";

                    // 서브헤더 클릭시 링크 -> 브랜드메인으로
                    angular.element("#head_sub > h2").bind('click',function(){
                        window.location.href = LotteCommon.storeLiveBrandURL+"?"+baseParam+"&elliv_shop_sn="+scope.sub_head_data.elliv_shop_sn+"&tclick="+storeliveTiclick.brand_name;
                    });
                });

                scope.swipeIndex = 0;
                scope.siwpeEnd = function(index){
                    scope.swipeIndex = index;
                }

                scope.wishSaved = false;
                scope.addWish = function() {
                    if(scope.wishSaved){
                        alert('이미 찜을 하셨습니다');
                        return;
                    }
                    goodsWish( scope.sub_head_data, scope ).then(function(res){
                        console.log( 'success', res );
                        scope.wishSaved = true;
                        getScope().sendTclick( storeliveTiclick.sub_base +"_"+ scope.sub_head_data.goods_no +"_Clk_Wsh" );
                    },function(err){
                        console.log( 'error', err );
                    });
                }

                // 전화문의
                scope.called = function(){
                    getScope().sendTclick( storeliveTiclick.base + "Brd_prd_" + scope.sub_head_data.goods_no + "_Clk_Btn_2" );
                    window.location.href="tel:"+scope.shopTel;
                }

                // 상품상세로 :: 상세유입코드 93
                scope.productView = function(){
                    productLink.ProdLink( {
                        goods_no : scope.sub_head_data.goods_no,
                        tclick : storeliveTiclick.base+"Brd_prd_"+scope.sub_head_data.goods_no+"_Clk_Btn_1&curDispNoSctCd=93&curDispNo="+storeliveTiclick.disp_no
                    },'goods' );
                }

                // 톡상담
                scope.csTalk = function() {
                    if(!scope.kakaoPlusFriendUrl) return;
                    getScope().sendTclick( storeliveTiclick.sub_talk + scope.sub_head_data.elliv_shop_sn );
                    // 팝업
                    if(!isApp) {
                        window.open( scope.kakaoPlusFriendUrl );
                    } else {
                        openNativePopup( getScope().subTitle, scope.kakaoPlusFriendUrl );
                    }
                }
                
                // 브랜드 목록 열기
                scope.brandListOpen = function(){
                    storeliveService.Observers.brandListState.set(true);
                }

                // 리사이징시 높이값 갱신 [ 20171205 ]
                var initW = window.innerWidth;
                scope.updateHeight = function(){
                    // 넓이값 변경시에만
                    if( parseInt(initW) == parseInt(window.innerWidth) ) return;
                    initW = window.innerWidth;

                    // 이미지를 담고 있는 엘리먼트
                    var igmEl = angular.element(".full_image_container .swipeBox li"),
                        w_arr = [];

                    $timeout(function(){
                        // 높이값이 10보다 높은 값을 배열에 저장
                        angular.forEach(igmEl.children(),function(element){
                            var image_el_h = angular.element(element)[0].clientHeight;
                            if(image_el_h>10) w_arr.push( image_el_h );
                        });
                        // 높이값이 가장 낮은 값으로 적용
                        if(w_arr.length) scope.hold_img_height = Math.min.apply(null, w_arr);
                    },300);
                }
                angular.element(window).bind('resize',scope.updateHeight);

                scope.resizeHeadContainer = function(){
                    if( parseInt(w) == parseInt(resize().width) ) return;
                    w = resize().width;
                    scope.head_img_height = resize().height-(head_h+foot_h);
                    scope.hold_img_height = detailViewHeight( resize().height-(head_h+foot_h) );
                }

                // 디바이스 높이값을 넘어가지 않도록
                scope.detailViewHeight = function( resizeHeight ) {
                    var device_h = window.innerHeight,
                        button_h = angular.element(".fix_buttons")[0].clientHeight,
                        header_h = angular.element("#head")[0].clientHeight;

                    scope.detail_image_loading = false;

                    if( resizeHeight > device_h - ( button_h+ header_h) ) {
                        scope.hold_img_height = device_h - (button_h+header_h);
                        console.log( '[over] detailViewHeight', scope.hold_img_height );
                    } else {
                        scope.hold_img_height = resizeHeight;
                        console.log( 'detailViewHeight', scope.hold_img_height );
                    }
                }

                scope.resizeHeadContainer();

                // 운영에서 콘솔로그 사용안함
                if( location.host == "m.ellotte.com" ) console.log = function(){};
            }
        }
    }]);

    /**
     * @ngdoc directive
     * @name resizeBlock
     *
     * @description
     * - 이미지 사이즈 체크
     * - 가장 작은 이미지 사이즈로 스와이프 컨테이너 높이값 적용
     *
     * - 20171204 운영서버 이유로 img tag에 onload로 체크하던 부분을
     * - watch로 변경
     */
    app.directive( 'resizeBlock', [ '$timeout',function($timeout){
        return {
            restrict:'A',
            link : function(scope,el){
                var imgLoadCehckWatch = scope.$watch(function(){
                    var n = [], len = el.children().length;
                    for( var i=0; i<len;++i) {
                        var complete = angular.element(el.children()[i]).find('img')[0].complete;
                        n.push( complete );
                    }
                    return JSON.stringify({
                        len : el.children().length,
                        imgs : n
                    });
                }, function(n){
                    if(!n) return;
                    var obj = JSON.parse(n),
                        pass = true;

                    console.log(obj);
                    console.log('체크된 값:'+obj.imgs.length, ', 데이터 이미지 개수:'+scope.goods_img_list.length);
                    if( obj.imgs.length != scope.goods_img_list.length ) return;

                    // 모두 완료인지 체크
                    for( var i in obj.imgs ) if(pass&&!obj.imgs[i]) pass = false;
                    if(!pass) return;

                    imgLoadCehckWatch(); // clear watch
                    loadComplete();

                    // 2초 후 높이값 변경이 없다면 재 실행
                    var heightTimeout = setInterval(function(){
                        if( !scope.hold_img_height || scope.hold_img_height < 0 ) {
                            console.log('scope.hold_img_height:'+scope.hold_img_height+' [높이값 없음! 추가실행]')
                            loadComplete();
                        } else {
                            clearInterval(heightTimeout);
                            console.log('clearInterval');
                        }
                    },1000);
                })

                function loadComplete(){
                    var img_h_list = [];
                    angular.forEach(el.children(),function(e,c){
                        var imgh = angular.element(e).find('img')[0].offsetHeight;
                        if( imgh>10 ) img_h_list.push( imgh );
                    });

                    if( img_h_list.length ) {
                        var applyHeight = Math.min.apply(null, img_h_list);
                        console.log('applyHeight',applyHeight);
                        scope.detailViewHeight( applyHeight );
                        $timeout(function(){scope.$apply()},300);
                    }
                    $timeout( scope.updateHeight, 1000 );
                }
            }
        }
    }])
    
    app.directive( 'subShopInfo', [ 'storeliveService', 'storeliveTiclick', 'productLink',
        function(storeliveService, storeliveTiclick, productLink ){
        return {
            restrict:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/sub/sub_shop_info.html',
            controller : 'utilsCtrl',
            scope:{},
            link : function( scope ) {
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    scope.shop_detail = res.sub_top.shop_detail;
                    scope.goods_no = res.sub_top.goods_detail.goods_no;
                });
                scope.shopWishState = false;
                scope.addShop = function() {
                    if(scope.shopWishState){
                        alert( '이미 찜을 하셨습니다' );
                        return;
                    }
                    scope.storeWish( scope.shop_detail ).then(function(res){
                        console.log(res);
                        scope.shopWishState = true;
                    },function(err) {
                        console.log(err);
                    });
                };
                scope.goShop = function(){
                    var item = scope.shop_detail;
                    // 매장 티클릭
                    productLink.ProdLink( {
                        elliv_shop_sn : item.elliv_shop_sn,
                        tclick : storeliveTiclick.shop + item.brnd_no
                    }, "shop_rnk" );
                }
                // 매장 전화연결
                scope.called = function(){
                    if(!scope.shop_detail.shop_ctfc_no ) return;
                    getScope().sendTclick( storeliveTiclick.base + "Brd_prd_" + scope.goods_no + "_Clk_Btn_2" );
                    window.location.href="tel:"+scope.shop_detail.shop_ctfc_no;
                }
            }
        }
    }]);

    app.directive( 'subShopCategoryTags', [ 'storeliveService', 'storeliveTiclick', 'LotteCommon',
        function( storeliveService, storeliveTiclick, LotteCommon ){
        return {
            restrict:'E',
            templateUrl : '/ellotte/resources_dev/mall/storelive/sub/sub_category_tags.html',
            scope:{},
            link : function( scope ) {
                storeliveService.watcher().$watch( storeliveService.observerStoreData(), function(res){
                    if(!res) return;
                    scope.tags = res.sub_top.category_tag_list.items;
                    //console.log(scope.tags, res );
                });
                scope.themeData = function( index ){
                    var tc = storeliveTiclick.base+"_Kwd_"+storeliveService.Observers.category.getValue().disp_no+"_prd_"+scope.tags[index].tag_sn;
                    var url = LotteCommon.mainUrl+"?"+baseParam+"&dispNo="+storeliveService.dispNo()+"&tag_sn="+scope.tags[index].tag_sn+'&cate_no='+scope.tags[index].disp_no;
                    window.location.href = url+"&tclick="+tc;
                }
            }
        }
    }]);

})(window, window.angular);