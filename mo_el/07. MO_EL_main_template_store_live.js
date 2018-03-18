/**
    ##############################
    ※ 백화점  라이브  전용 ( store live ) ※
    @author :  박해원
    @date : 20170904
    @last-modify :
    ##############################
*/

(function(){
    var app = angular.module('StoreLive',[
        'lotteComm',
        'lotteNgSwipe',
        'lotteProduct',
        'storeliveComm'
    ]);

    /**
     * 메인 공통
     */
    app.controller( 'storeLiveCtrl', ['$scope','storeliveService','storeliveApi', 'LotteCommon', 'storeliveTiclick',
    function ($scope,storeliveService,storeliveApi, LotteCommon, storeliveTiclick) {

        /**
         * 카테고리 하위 태그 갱신
         * @param item
         */
        $scope.updateCategory = function(item){
            // 카테고리 업데이트
            storeliveService.Observers.tag_sn.set( null );
            storeliveService.Observers.category.set( item );
            // 카테고리에 포함된 태그 로드
            storeliveApi({
                url : LotteCommon.storeLiveMainMiddle,
                data : {
                    cate_no:item.disp_no,
                    tag_sn:item.tag_sn || storeliveService.Observers.tag_sn.getValue()
                }
            }).then(function(res){
                $scope.storeliveData.category_thema_tag_list = res.main_middle.category_thema_tag_list;
            },function(er){
                console.log( '[disp_no:'+item.disp_no+'] : 태그목록 로드 실패', er );
            });
        }

        /**
         * 태그선택
         * @param c
         */
        $scope.themeData = function( c ) {
            if(storeliveService.Observers.productLoading.getValue() ) {
                alert( storeliveService.msg.load.loading );
                return;
            }
            if( $scope.storeliveData.category_thema_tag_list.items[c].tag_select_yn == 'Y' ) return;
            for( var i=0; i<$scope.storeliveData.category_thema_tag_list.items.length; ++i ) {
                $scope.storeliveData.category_thema_tag_list.items[i].tag_select_yn = 'N';
            }
            // 태그 활성화
            $scope.storeliveData.category_thema_tag_list.items[c].tag_select_yn = 'Y';
            $scope.storeliveData.tagIndex = c;
            // 티클릭
            var tc = storeliveTiclick.category_tag + storeliveService.Observers.category.getValue().disp_no +"_"+ $scope.storeliveData.category_thema_tag_list.items[c].tag_sn;
            $scope.sendTclick( tc );
            // 태그 갱신
            storeliveService.Observers.tag_sn.set( $scope.storeliveData.category_thema_tag_list.items[c].tag_sn );
        }

    }]);

    app.directive( 'storeLive', ['$rootScope', 'storeliveService', 'LotteCommon', 'storeliveApi', 'commInitData', '$timeout',
    function( $rootScope, storeliveService, LotteCommon, storeliveApi, commInitData, $timeout ){
		return {
		    controller:'storeLiveCtrl',
            replace:true,
			link : function( $scope, e, a, c ) {

                var locData = { baseData:null, observers:null };
                // Screen Type
                storeliveService.setProductKeyName( 'main' );

                // 스토어 라이브 전용 데이터
                // 메인과 같은 구조로 페이지 벗어날시 아래 데이터를 sessionStorage에 저장
                $scope.storeliveData = {
                    goods_list: [], // 상품목록
                    main_img_banner_list : {}, // 메인탑 배너
                    main_md_banner_title : {}, // MD 추천 타이틀
                    main_md_banner_list : {}, // MD 추천 목록
                    main_thema_tag_list : {}, // 테마태그 목록
                    main_shop_aemp_list : {}, // 샵매니저
                    main_category_list : {}, // 메인 카테고리
                    category_thema_tag_list : {}, // 카테고리 태그 목록
                    page : 0, // 목록 페이지
                    end : false, // 풀 로드 여부
                    totalPage:0, // 총 페이지
                    tag_open_state : false, // 상단 태그 열고, 닫기
                    sort : 1, // 최신, 인기 ( 최신:1, 인기:2 ) 기본값이 1
                    alignOptoins : [
                        { name:'최신', value:1 },
                        { name:'인기', value:2 }
                    ],
                    goods_total_count:0, // 총 상품개수
                    loading : false,
                    not_cate_list : false, // 카테고리가 없을경우
                    cateIndex : -1,
                    tagIndex: -1,
                    cache: storeliveService.cacheMode
                };

                /**
                 * 엘롯데 메인(..phone.js)에서 storeliveService호출로 이벤트 발생
                 */
                storeliveService.getStoreLiveInit().then(function(res){
                    if(!res) return;
                    // 태그자동선택 파라미터
                    if(commInitData.query.cate_no) {
                        storeliveService.Observers.category._value = { disp_no:commInitData.query.cate_no }
                    }
                    if(commInitData.query.tag_sn) {
                        storeliveService.Observers.tag_sn._value = commInitData.query.tag_sn;
                    }
                    commInitData.query.cate_no = commInitData.query.tag_sn = null;
                    // 로딩시작
                    storeliveService.Observers.pageloading.set(true);

                    // 테스트를 위해 캐쉬모드 사용안함
                    //storeliveService.cacheMode = false;

                    // 스토리지 불러오기
                    if( !storeliveService.Observers.category.getValue() && storeliveService.cacheMode ) {
                        try{ locData = JSON.parse( storeliveService.storeLiveSessionStorage.get() ) }
                        catch(e) { console.log( '로컬캐쉬 불러오기 에러'); locData = {} }
                        try {
                            // 옵저버 복구
                            if (locData.observers) {
                                for (var i in locData.observers) {
                                    storeliveService.Observers[i]._value = locData.observers[i];
                                }
                            }
                        } catch(e){
                            locData = { baseData:null, observers:null };
                        }
                        // 스크롤 위치
                        $timeout(function(){
                            var sctop = sessionStorage.getItem('elMainScrollY')
                            window.scrollTo(0, sctop);
                        },2000);
                        // 로딩숨김
                        storeliveService.Observers.pageloading.set(false);
                    };

                    if(!locData.baseData||!locData.observers){
                        $scope.storeliveData.cache = false;
                        loadData();
                    }
                    else {
                        locData.baseData.cache = storeliveService.cacheMode;
                        $scope.storeliveData = locData.baseData;
                    }
                    // 로컬캐쉬 삭제
                    storeliveService.storeLiveSessionStorage.clear();
                });

                /**
                 * 로딩 상태 변경
                 * @type {boolean}
                 */
                storeliveService.Observers.loading.get().then( null, null, function(res){
                    if( typeof res != 'boolean' ) return;
                    storeliveService.Observers.productLoading.set(res);
                });
                storeliveService.Observers.productLoading.get().then(null,null,
                function(res){
                    $scope.storeliveData.loading = res;
                });

                /**
                 * 메인의 2개(top,middle)의 데이타중에 top로드
                 */
                function loadData () {
                    // 기본 데이타 ( main_top )
                    var reqParams = {
                        url : LotteCommon.storeMainTop,
                        // 스테이지, 운영 코드가 다름 ( storeliveService관리 )
                        data : { disp_no : storeliveService.dispNo() }
                    };

                    /**
                     * 비동기 업데이트
                     * storeliveData 구조는 샘플 json 포멧과 동일하게 해두었음으로
                     * for in으로 일괄 적용
                     */
                    storeliveApi(reqParams).then(function(res){
                        for( var i in res.main_top ) {
                            $scope.storeliveData[i] = res.main_top[i];
                        }

                        try { // 카테고리 목록이 없을경우 디폴트값
                            if( !$scope.storeliveData.main_category_list.items.length ) {
                                $scope.storeliveData.main_category_list.items = [ {disp_no:999} ];
                                $scope.storeliveData.not_cate_list = true;
                            }
                        } catch(e){
                            $scope.storeliveData.main_category_list.items = [ {disp_no:999} ];
                            $scope.storeliveData.not_cate_list = true;
                        }
                        // 로딩숨김
                        storeliveService.Observers.pageloading.set(false);
                    });
                }

                // 페이지 벗어날때 스토리지에 저장
                window.onunload = function(){
                    var leaveIs = storeliveService.storeLiveSessionStorage.get( 'storeLivePageLeave' ) || {};
                    leaveIs = JSON.parse(leaveIs);
                    // 백화점 라이브내 링크를 타고 페이지를 벗어난 경우에만
                    if(storeliveService.cacheMode && leaveIs.pageleave) { // 캐쉬모드 사용일때만
                        // 카테고리값이 있을경우
                        if (storeliveService.Observers.category.getValue()) {
                            var strgData = {
                                baseData: $scope.storeliveData,
                                observers: {}
                            }
                            for (var i in storeliveService.Observers) {
                                if (i != "add") strgData.observers[i] = storeliveService.Observers[i].getValue();
                            }
                            storeliveService.storeLiveSessionStorage.set(strgData);
                        }
                        storeliveService.storeLiveSessionStorage.clear( 'storeLivePageLeave' );
                    }
                }
			}
		}
	}]);

    /**
        [백화점 라이브]
        @백화점 라이브 상단 배너
    */
    app.directive( 'storeTopBanner',[ 'storeliveService', function( storeliveService ){
		return {
			link : function( scope ) {
                scope.$watch( 'storeliveData.main_img_banner_list', function(n,o){
                    if( !n ) return;
                });
                scope.brandListOpen = function(){
                    storeliveService.Observers.brandListState.set(true);
                }
			}
		}
	}]);

	/**
		[백화점 라이브]
		@테마태그목록
	*/
	app.directive( 'storeLiveThemeTag', [ 'storeliveTiclick', 'commInitData', 'storeliveService', '$timeout',
    function( storeliveTiclick, commInitData, storeliveService, $timeout ){
		return {
            restrict:'E',
			templateUrl : '/ellotte/resources_dev/main/template/tmpl_store_live_theme_tag.html',
			link : function( scope ) {

                scope.show_tag_more = false;
                scope.$watch( 'storeliveData.main_thema_tag_list', function(n,o){
                    try { if(!n.items.length) return; }
                    catch(e) { return }

                    moreState();
                });

                /**
                 * 더보기 버튼
                 * 테마태그 목록이 2줄이 되면 보이도록
                 */
                function moreState(){
                    if(!scope.show_tag_more) {
                        $timeout(function(){
                            var tagContainer = angular.element("#store_live_main_theme_tag")[0];
                            if( tagContainer.clientHeight > 32 ) scope.show_tag_more = true;
                        },300);
                    }
                }

                /**
                 * 더보기 ( 펼치기, 접기 )
                 */
				scope.tagToggle = function(){
					scope.storeliveData.tag_open_state = !scope.storeliveData.tag_open_state;
					scope.sendTclick( scope.storeliveData.tag_open_state ? storeliveTiclick.theme_tag_open : storeliveTiclick.theme_tag_close );
				}
			}
		}
	}]);

    /**
     * @BEST 샵 매니저
     */
	app.directive( 'storeLiveShopManager',[ 'storeliveTiclick', 'productLink', 'storeliveTiclick', 'storeliveService', function( storeliveTiclick, productLink, storeliveTiclick, storeliveService ){
		return {
			templateUrl : '/ellotte/resources_dev/main/template/tmpl_store_live_manager.html',
			link : function( scope) {
                scope.$watch( 'storeliveData.main_shop_aemp_list', function(n,o){
                    if(!n) return;
                });
                scope.goShop = function( item, index ){
                    // 매장 티클릭
                    scope.sendTclick( storeliveTiclick.shop + item.elliv_shop_sn );
                    // 브랜드메인으로 연결
                    var tIndex = (index+1) < 10 ? "0"+(index+1) : (index+1);
                    productLink.ProdLink( {
                        elliv_shop_sn : item.elliv_shop_sn,
                        tclick : storeliveTiclick.best_shop_manager + tIndex +"_"+item.brnd_no
                    }, "shop_rnk", index );
                }
			}
		}
	}]);

    /**
     * 샵매니저 찜 등록 ( 메인에서만 세션스토리지에 저장해서 중복클릭을 방지 )
     * storeLiveShopManager 개별 아이템에서 사용
     */
	app.directive( 'storeLiveWish',['LotteStorage', 'storeliveApi', 'storeliveService', 'LotteCommon', 'storeliveTiclick',
    function( LotteStorage, storeliveApi, storeliveService, LotteCommon, storeliveTiclick ){
		return {
            scope: { wishData:'=', managerItemIndex:'=', loginInfo:'=' },
            templateUrl : '/ellotte/resources_dev/main/template/tmpl_store_live_wish.html',
            link: function( scope ){
                var wishID, mrNo;

                /**
                 * localStorage 추가, 반환
                 * @param id
                 * @param val
                 */
                function storage ( id, val ) {
                    console.log( id, val );
                    if( id && val ) storeliveService.storeLiveSessionStorage.set(val, id );
                    if( id && !val ) return storeliveService.storeLiveSessionStorage.get( id );
                }

                /**
                 * 스토리지 아이디 생성
                 * @param mrNo
                 * @returns {*}
                 */
                function getWishName ( mrNo ) {
                    return "wishCountId"+(mrNo||"guest")+"_"+scope.wishData.shop_aemp_seq+"_"+scope.wishData.elliv_shop_sn;
                }

                /**
                 * 찜 등록
                 * @param count
                 */
                function setCount( count ){
                    if(count) {
                        try {
                            storeliveApi({
                                url: LotteCommon.storeliveShopMasterWish,
                                //method: 'post',
                                data: {
                                    elliv_shop_sn: scope.wishData.elliv_shop_sn,
                                    shop_aemp_seq: scope.wishData.shop_aemp_seq
                                },
                                dataType: 'json'
                            }).then(function (res) {
                                if (res.result_status == 'success') {
                                    //alert('찜 등록이 정상적으로 되었습니다.');
                                    scope.wishData.shop_aemp_rgl_cust_cnt++;
                                    scope.wishData.active = true;
                                    storage(wishID, {
                                        elliv_shop_sn: scope.wishData.elliv_shop_sn,
                                        shop_aemp_seq: scope.wishData.shop_aemp_seq
                                    });
                                } else {
                                    try {
                                        alert(res.arror_msg.response_msg)
                                    }
                                    catch (e) {
                                    }
                                }
                            }, function (err) {
                                console.log('[ERROR] result', err);
                            })
                        } catch(e) { }
                    } else {
                        scope.wishData.active = true;
                        storage( wishID, {
                            elliv_shop_sn: scope.wishData.elliv_shop_sn,
                            shop_aemp_seq: scope.wishData.shop_aemp_seq
                        });
                    }
                }

                function wishInit(){
                    scope.loginInfo = { loginCheck:getLoginInfo() };
                    if( !scope.wishData || !scope.loginInfo.loginCheck ) return;
                    mrNo = scope.loginInfo.loginCheck ? scope.loginInfo.loginCheck.mbrNo : null;
                    if( !scope.wishData.shop_aemp_rgl_cust_cnt || !scope.wishData.shop_aemp_seq || !scope.wishData.elliv_shop_sn ) return;
                    wishID = getWishName( mrNo || 'guest' );
                    if( storage(wishID) ) setCount();
                }

                scope.$watch('wishData', function(wish){
                    if(wish) wishInit();
                });

                /**
                 * 찜 등록 체크
                 */
                scope.addWish = function(){
                    if(scope.wishData.active){
                        alert( '이미 찜을 하셨습니다.' );
                        return;
                    }
                    setCount(true);
                    getScope().sendTclick( storeliveTiclick.best_shop_manager + storeliveService.addZero( scope.managerItemIndex ) );
                }
            }
		}
	}]);

	/**
		[백화점 라이브]
		@MD 추천
	*/
	app.directive( 'storeLiveMdRecoms',[ 'storeliveTiclick', 'storeliveService', function( storeliveTiclick, storeliveService ){
		return {
			templateUrl : '/ellotte/resources_dev/main/template/tmpl_store_live_md_recom.html',
			link : function( scope ) {
                scope.$watch( 'storeliveData.main_md_banner_title', function(n,o){
                    if(!n) return;
                });
                scope.$watch( 'storeliveData.main_md_banner_list', function(n,o){
                    if(!n) return;
                });
                // 상품 데이타어 포함된 URL로 연결 ( 기획전, 상품상세 )
                scope.prdURL = function( item, index ) {
                    storeliveService.storeLiveSessionStorage.set({pageleave:true}, 'storeLivePageLeave' ); // 링크이동시 메인 데이터 저장 여부
                    var URL = item.link_url + "&tclick=" + ( storeliveTiclick.base +"_"+ storeliveTiclick.disp_no + storeliveTiclick.md_recomm + storeliveService.addZero( index+1 ) );
                    window.location.href = URL + "&" +scope.baseParam;
                }
			}
		}
	}]);

	/**
		[백화점 라이브]
		@카테고리
	*/
	app.directive( 'storeLiveCategory',[ 'storeliveService', 'storeliveTiclick', 'commInitData', '$timeout',
    function( storeliveService, storeliveTiclick, commInitData, $timeout ){
		return {
            restrict: 'E',
            controller:'storeLiveCtrl',
            templateUrl: '/ellotte/resources_dev/main/template/tmpl_store_live_category.html',
            link: function (scope) {

                var cache = true,
                    initFlag = false;
                scope.$watch('storeliveData.main_category_list', function (n) {
                    try { if(!n.items.length) return }
                    catch(e){ return }

                    // 캐쉬모드면 종료
                    if( scope.storeliveData.cache ) return;

                    // [캐쉬모드] 최초 1번 적용
                    if(cache) {
                        if( storeliveService.Observers.category.getValue() && storeliveService.Observers.tag_sn.getValue() ) {
                            var cate_no = storeliveService.Observers.category.getValue().disp_no;
                            for( var i =0; i<n.items.length; ++i ) {
                                if( n.items[i].disp_no == cate_no ) {
                                    var c = angular.copy( n.items[i] );
                                    c.tag_sn = storeliveService.Observers.tag_sn.getValue();
                                    c.trigger = true;
                                    $timeout(function () {
                                        scope.categoryActive(i, c);
                                        moveY();
                                    }, 1000 );

                                    initFlag = true;

                                    break;
                                }
                            }
                        }
                    }
                    cache = false;

                    // 기본값 적용
                    if( !cache && !initFlag ) {
                        scope.screenData.cateIndex = 0;
                        var c, cnt =0, cindex = -1;
                        for( var i=0; i<scope.storeliveData.main_category_list.items.length;++i){
                            // 선택은 disp_select_yn값이 'Y' 인 것
                            if( scope.storeliveData.main_category_list.items[i].disp_select_yn == "Y" ) {
                                c = scope.storeliveData.main_category_list.items[i];
                                if( cindex == -1 ) cindex = i;
                                storeliveService.Observers.categoryIndex.set(i);
                                cnt++;
                            }
                        }
                        // 기본값이 없거나 disp_select_yn 'Y'가 1개이상이면 기본값 999로 선택
                        if(!c || cnt > 1 ) c = searchCatNo( 999, true );
                        if( storeliveService.Observers.tag_sn.getValue() ) {
                            c.tag_sn = storeliveService.Observers.tag_sn.getValue();
                            c.trigger = true;
                        }
                        scope.screenData.cateIndex = cindex;
                        scope.updateCategory(c);
                    }
                    initFlag = true;
                });

                function searchCatNo( dispNo, searchIndex ) {
                    if(!scope.storeliveData.main_category_list.items.length) return null;
                    for( var i=0; i<scope.storeliveData.main_category_list.items.length;++i ) {
                        if( scope.storeliveData.main_category_list.items[i].disp_no == dispNo ) {
                            if( searchIndex ) storeliveService.Observers.categoryIndex.set(i);
                            return scope.storeliveData.main_category_list.items[i];
                        }
                    }
                }

                /**
                 * 상단태그 클릭
                 * @param item
                 */
                scope.top_tag_select_index = -1;
                scope.categoryTrigger = function (item, index) {
                    if(storeliveService.Observers.productLoading.getValue() ) {
                        alert( storeliveService.msg.load.loading );
                        return;
                    }

                    // 카테고리 목록이 없을경우
                    if( scope.storeliveData.not_cate_list ) {
                        storeliveService.Observers.tag_sn.set( item );
                        movePrdListTop();
                        return;
                    }

                    scope.top_tag_select_index = index;
                    // 카테고리가 같으면 카테고리 업데이트 하지 않음
                    if( storeliveService.Observers.category.getValue() ) {
                        if( storeliveService.Observers.category.getValue().disp_no == item.disp_no ) {
                            var ctag = scope.storeliveData.category_thema_tag_list.items || [];
                            for( var i=0;i<ctag.length;++i) {
                                if(item.tag_sn == ctag[i].tag_sn) {
                                    scope.themeData(i);
                                    break;
                                }
                            }
                            moveY();
                            return;
                        }
                    }
                    for(var i = 0; i < scope.storeliveData.main_category_list.items.length; ++i) {
                        if (scope.storeliveData.main_category_list.items[i].disp_no == item.disp_no) {
                            scope.categoryActive(i, item);
                            scope.sendTclick( storeliveTiclick.theme_tag + (index+1) );
                            moveY();
                            return;
                        }
                    }
                }

                /**
                 * 카테고리 화면으로 스크롤 이동
                 */
                function moveY() {
                    var scrollY = angular.element(".store_live_category")
                        .offset().top - angular.element("#gnb")[0].clientHeight;
                    window.scrollTo(0, scrollY);
                }
                function movePrdListTop(){
                    var scrollY = angular.element("store-live-product-list")
                        .offset().top - angular.element("#gnb")[0].clientHeight;
                    window.scrollTo(0, scrollY);
                }

                /**
                 * 태그 클릭시
                 * @param i
                 * @param item
                 */
                scope.categoryActive = function (i, item) {
                    if(storeliveService.Observers.productLoading.getValue() ) {
                        alert( storeliveService.msg.load.loading );
                        return;
                    }

                    // [storeLiveCtrl] 하위 카테고리 갱신
                    var sendItem = angular.copy( scope.storeliveData.main_category_list.items[i] );

                    // 중복이면 종료
                    if( ( !item && !storeliveService.Observers.tag_sn.getValue() ) &&  (typeof i == 'number' && scope.storeliveData.main_category_list.items[i].disp_select_yn == 'Y') ) return;
                    angular.forEach(scope.storeliveData.main_category_list.items, function (e, n, c) {
                        e.disp_select_yn = 'N';
                    });

                    // 티클릭을 위한 index값
                    storeliveService.Observers.categoryIndex.set(i);
                    scope.sendTclick( storeliveTiclick.category + scope.storeliveData.main_category_list.items[i].disp_no );
                    // 탭선택
                    scope.storeliveData.main_category_list.items[i].disp_select_yn = 'Y';
                    if(item) {
                        sendItem.tag_sn = item.tag_sn;
                        sendItem.trigger = true;
                    }
                    // 카테고리 업데이트 및 하위 태그 로드
                    scope.screenData.cateIndex = i;
                    scope.updateCategory(sendItem);
                }
            }
        }
	}]);

	/**
		[백화점 라이브]
		@태그목록
	*/
	app.directive( 'storeLiveCategoryTag',['storeliveService', 'storeliveTiclick', 'commInitData', '$timeout',
    function( storeliveService, storeliveTiclick, commInitData, $timeout ){
		return {
            controller:'storeLiveCtrl',
			templateUrl : '/ellotte/resources_dev/main/template/tmpl_store_live_category_theme_tag.html',
			link : function( scope, e, a, c ) {
                // 상위 카테고리를 통해서 갱신될때 디폴트가 전체
                scope.$watch('storeliveData.category_thema_tag_list', function(n,o){
                    try{ if(!n.items.length) return }
                    catch(e) { return }

                    // 상단 테마태그 클릭인경우 태그 목록에서 셀릭트값이 'Y'인 상품목록 로드
                    var curCat = storeliveService.Observers.category.getValue() || {}, is_not_found = true,
                        tag_sn = curCat.tag_sn;

                    // 캐쉬모드면 종료
                    if( scope.storeliveData.cache ) return;

                    $timeout(function(){
                        if (curCat.trigger) {
                            curCat.trigger = false;
                            storeliveService.Observers.category._value = curCat;

                            var match_tag_Index = -1;
                            for (var i = 0; i < n.items.length; ++i) {
                                // 태그목록중에 Y값이 있을경우
                                if ( is_not_found && n.items[i].tag_select_yn == 'Y') {
                                    is_not_found = false;
                                    scope.storeliveData.tagIndex = i;
                                    storeliveService.Observers.tag_sn.set(n.items[i].tag_sn);
                                }
                                // 태그목록에 Y값이 없을경우 사용
                                if( tag_sn && match_tag_Index == -1 ) {
                                    if( n.items[i].tag_sn == tag_sn ) match_tag_Index = i;
                                }
                            }

                            if( is_not_found && match_tag_Index != -1 ) {
                                is_not_found = false;
                                n.items[match_tag_Index].tag_select_yn = "Y";
                                storeliveService.Observers.tag_sn.set(n.items[match_tag_Index]);
                            }

                            // 해당 태그가 없을경우
                            if( is_not_found ) {
                                console.log( '해당 태그가 목록이 존재하지 않음', curCat );
                                curCat.trigger = false;
                                curCat.tag_sn='';
                                storeliveService.Observers.category.set( curCat );
                            }
                        }
                    },300)
                });

                /**
                 * 더보기
                 */
                scope.tagToggle = function(){
					scope.storeliveData.tag_open_state = !scope.storeliveData.tag_open_state;
				}

			}
		}
	}]);

})();
