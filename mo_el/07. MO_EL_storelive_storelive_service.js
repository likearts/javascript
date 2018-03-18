/*
   ##############################
   ※ 백화점  라이브  전용 ( store live ) ※
   @author :  박해원
   @date : 20170904
   @last-modify :
   ##############################
*/

(function(){
    angular.module('storeliveComm', [])

    /**
     * 백화점라이브 티클릭
     * 조합형 티클릭은 발생함수 안에 하드코딩 되어 있음 ( ex : a_123_b_456_c_01 )
     */
    .factory( 'storeliveTiclick', ['storeliveService',function(storeliveService){
        var base = "m_El_elDeptLive";
        return {
            disp_no : storeliveService.dispNo(), // 스토어라이브 전시코드(운영) ※ 스테이지, 운영 전시코드 다르게 설정되어 임시로 여기 넣음
            base : "m_El_elDeptLive",
            // ###### MAIN ###########################################
            theme_tag : base+'_MainKeyword_', // 메인 테마태그
            theme_tag_open : base+'_Kwd_Open', // 메인 메마태그 열기
            theme_tag_close : base+'_Kwd_Close', // 메인 테마태그 닫기
            shop : base+"_Clk_", // 매장 티클릭
            best_shop_manager : base+'_ShopM_', // 베스트 샵 매니저
            category_tag : base+'_Kwd_', // 카테고리 테마태그
            brand_list_open : 'm_elDepLive_Clk_Btn_DptS', // 브랜드 목록 열기 버튼 클릭시
            md_recomm : '_Swp_Ban_idx', // MD 추천상품
            category : base+'_Cat_', // 카테고리
            prod_list_sort : base+"_Clk_Sort_", // 상품목록 Sort
            prod_wish : base+'_Clk_Wsh', // 상품목록 위시
            prod_sub_wish : base+"_Brd_Prd_", // 상품 서브, 브랜드 위시
            prod_plan : base+"_Clk_Ban_", // 기획전 배너
            prod_rank_a : base+'Clk_prd_A', // 방문 베스트
            prod_rank_b : base+'Clk_prd_B', // 찜 베스트
            prod_rank_c : base+'Clk_prd_C', // 스토어찜 베스트
            // ###### SUB ###########################################
            sub_base : base+"_Brd_prd",
            sub_talk : base+"_Brd_prd_Clk_Btn_",
            // ###### BRAND #########################################
            brand_store_wish : base+"_Brd_prd_Clk_Btn_2",
            brand_name : base+"_Brd_prd_Clk_Btn_1",
            // ###### BRAND LIST ( 우측 레이어 ) ####################
            brand_list_store : 'm_side_elDeptLive_DptS_',
            brand_list_brand : 'm_side_elDeptLive_brand_idx'
        }
    }])

    /**
     * [ 링크 ] : 상품, 배너, 랭킹, 브랜드
     * @type {{itemLinkProcess: itemLinkProcess, getParam: getParam}}
     */
    .factory( 'productLink', [ 'LotteCommon', 'storeliveService', 'storeliveTiclick', function(LotteCommon, storeliveService, storeliveTiclick){
        var lnik = {

            /**
             * 페이지이동
             * @param {Object} item
             * @param {String} type
             * @param {Number} index
             * @param {Number} best_no
             * @constructor
             */
            ProdLink : function( item, type, index, best_no ) {
                var URL = lnik.getParam( item, type, index, best_no );
                if( URL ) {
                    storeliveService.storeLiveSessionStorage.set({pageleave:true}, 'storeLivePageLeave' );
                    window.location.href=URL;
                }
                else console.log( '링크없음', URL );
            },

            /**
             * URL + 티클릭
             * @param {Object} item
             * @param {String} type
             * @param {Number} index
             * @param {Number} best_no
             * @returns {string}
             */
            getParam : function( item, type, index, best_no) {
                var prdURL = "", params={};
                switch( type ) {
                    // 배너형 ( 브랜드 메인 )
                    case "spdp_banner":
                        prdURL = item.link_url;
                        params = {
                            tclick: item.tclick  || ( storeliveTiclick.prod_plan + item.disp_prior_seq )
                        }
                        break;
                    // 상품 목록 ( 백화점 라이브 서브 페이지 )
                    case "elliv_goods":
                        prdURL = LotteCommon.storeLiveSubURL;
                        var tc = storeliveTiclick.base+storeliveTiclick
                                .disp_no+"_Cat_"+storeliveService
                                .Observers.category.getValue().disp_no+"_Clk_Prd_"+storeliveService
                                .addZero( index+1 );
                        params = {
                            dpts_liv_goods_no: item.dpts_liv_goods_no,
                            elliv_shop_sn: item.elliv_shop_sn,
                            cate_no: item.disp_no,
                            tclick: item.tclick || tc
                        }
                        break;
                    // 상품 랭킹 ( 백화점 라이브 서브 페이지 )
                    case "goods_rnk":
                        prdURL = LotteCommon.storeLiveSubURL;
                        params = {
                            dpts_liv_goods_no: item.dpts_liv_goods_no,
                            elliv_shop_sn: item.elliv_shop_sn,
                            cate_no: item.disp_no,
                            tclick: item.tclick || lnik.rankingTclick(best_no) + storeliveService.addZero( index+1 )
                        }
                        break;
                    // 샵 랭킹 브랜드 메인
                    case "shop_rnk":
                        prdURL = LotteCommon.storeLiveBrandURL;
                        params = {
                            elliv_shop_sn : item.elliv_shop_sn,
                            tclick: item.tclick || lnik.rankingTclick(best_no) + storeliveService.addZero( index+1 )
                        }
                        break;
                    // 제품상세
                    case "goods":
                        prdURL = LotteCommon.productviewUrl;
                        var tc = storeliveTiclick.base+storeliveTiclick
                            .disp_no+"_Cat_"+storeliveService
                            .Observers.category.getValue().disp_no+"_Clk_Prd_"+storeliveService
                            .addZero( index+1 );
                        params = {
                            goods_no : item.goods_no,
                            tclick: item.tclick || tc
                        }
                        break;
                }

                var pr = prdURL.indexOf("?") != -1 ? "&" : "?";
                prdURL += pr + baseParam;
                for( var k in params ) if( k ) prdURL+="&"+k+"="+params[k];

                return prdURL;
            },

            /**
             * 랭킹타입별 티클릭
             * @param {Number} best_no
             * @returns {String}
             */
            rankingTclick : function( best_no ){
                var tc;
                switch( String(best_no) ){
                    case "1":
                        tc = storeliveTiclick.prod_rank_b;
                        break;
                    case "2":
                        tc = storeliveTiclick.prod_rank_c;
                        break;
                    case "3":
                        tc = storeliveTiclick.prod_rank_a;
                        break;
                }
                if( !tc ) console.log( 'best_flag값이 없음' );
                return tc;
            }
        }
        return lnik;
    }])

    /**
     * 제폼 목록 컨테이너
     * [ template ]
     */
    .factory( 'storeLiveTmpl', [ 'storeliveService', function( storeliveService ){
        function templeteURL () {
            var tmplURL = "";
            switch( storeliveService.getStoreLiveTmpl() ) {
                case "storeLivemain" : // 메인 ( 홈 탭 메인 )
                    tmplURL ="/ellotte/resources_dev/main/template/tmpl_storelive_main_product_list.html";
                break;
                default: // 기본 서브, 브랜드메인
                    tmplURL ="/ellotte/resources_dev/mall/storelive/sub/product_list.html";
            }
            return tmplURL;
        }
        return templeteURL();
    }])

    /**
     * 제품목록 유닛
     * [ template ]
     * @params : string
     */
    .factory( 'prdTmplList', [ 'storeliveApi', '$q', function( storeliveApi, $q ){
       return function( type ){
            var TmplURL = "", d = $q.defer();
            switch(type) {
                case "storeLivemain":
                    TmplURL = "/ellotte/resources_dev/product_unit/product_unit_store_live_main.html";
                    break;
                default:
                    TmplURL = "/ellotte/resources_dev/product_unit/product_store_live_01.html";
            }

            storeliveApi({url :TmplURL, dataType : 'html'})
            .then( d.resolve, d.reject );

            return d.promise;
       }
    }])

    /**
     * 데이타 로드
     *  @params : object
     */
    .factory( 'storeliveApi', [ 'storeliveService', '$q', 'commInitData', function( storeliveService, $q, commInitData ) {
        return function( params ) {
            var d = $q.defer();
            if( !params.data ) params.data = {};
            if( commInitData.query.preview ) params.data.preview = commInitData.query.preview;
            $.ajax({
                url : params.url,
                data : params.data,
                dataType : params.dataType || 'json',
                type : params.method || 'get'})
                .then(function(res){
                        d.resolve(res);
                        // storeliveService 통한 업데이트 ( 기본 데이타는 공통사용 )
                        if( params.dataName == 'baseData' ) storeliveService.setData(res);
                        try{ if(params.dataName) storeliveService.Observers[params.dataName].set(res); } catch(e) {}
                    },
                    function(er){
                        d.reject(er);
                        // storeliveService 통한 업데이트
                        if( params.dataName == 'baseData' ) storeliveService.setData(er, params);
                        try{ if(params.dataName) storeliveService.Observers[params.dataName].set(er); } catch(e) {}
                    }
                );
            return d.promise;
        }
    }])
    
    /**
     * Observer List
     * @returns {$rootScope|*}
     */
    .service( 'storeliveService', [ '$rootScope', '$q', function( $rootScope, $q ){

        /**
         * GLOBAL WATCHER ( scope )
         * setGlobalWatcher는 등록후 변경 불가
         */
        this._globalwatcher;
        this.watcher = function(){
            return this._globalwatcher || $rootScope;
        };
        this.setGlobalWatcher = function( target ) {
            if(this._globalwatcher) this._globalwatcher = target;
        }

        /**
         * screenType ( 홈 탭 메인, 서브, 브랜드 메인 )
         */
        this._storeliveTmplName;
        this.setStoreLiveTmpl = function( name ) {
            this._storeliveTmplName = name;
        }
        this.getStoreLiveTmpl = function() {
            return this._storeliveTmplName;
        }

        /**
         * rootScope에 추가
         * @param scope
         */
        this.setAddScope = function( scope ) {
            if(!scope ) return;
            for( var i in scope ) {
                if( !$rootScope[i] ) {
                    $rootScope[i] = scope[i];
                } else {
                    console.log( '[ERROR:중복] : ' + i, $rootScope[i] );
                }
            }
        }

        /**
         * rootScope data name ( watch )
         * @type {string}
         */
        this.serviceName = 'storeliveService';
        this.observerStoreData = function(){
            return this.serviceName;
        }
        this.setData = function(data) {
            this.watcher().storeliveService=data;
            this.watcher().$apply();
        }

        /**
         * Observer list
         * @type {{init: Observers.init}}
         */
        this.Observers = {
            add : function( observerNames ) {
                var keys = observerNames;
                if( typeof observerNames == 'string' ) keys = [ observerNames ];
                for( var i=0; i<keys.length; ++i ) {
                    this[ keys[i] ] = {};
                    this[ keys[i] ]._value = null;
                    this[ keys[i] ].d = $q.defer();
                    this[ keys[i] ].set = function( data ) {
                        this._value = data;
                        this.d.notify(data);
                    };
                    this[ keys[i] ].get = function(){
                        return this.d.promise;
                    };
                    this[ keys[i] ].getValue = function(){
                        return this._value;
                    }
                }
               //console.log( '[Observer list] : ' + keys );
            }
        }
        // default observer's
        this.Observers.add( [
            'baseData', // 기본(필수) 데이타는 비동기
            'pageloading',
            'loading',
            'productLoading',
            'storeliveProductList',
            'category',
            'categoryIndex',
            'brandListState', // [브랜드목록] 우측 레이어 열고, 닫기
            'tag_sn'
        ]);
        this.resetObservers = function(){
            for( var i in this.Observers ) {
                if( i != 'add' ) this.Observers[i]._value = null;
            }
        }

        /**
         * 데이터 타입
         */
        var product_defer = $q.defer();
        this.getProductKeyName = function(){
            return product_defer.promise;
        }
        this._product_key_name;
        this.setProductKeyName = function( name ) {
            this._product_key_name = name;
            product_defer.resolve(name);
        }
        this.getProductKeyNameValue = function(){
            return this._product_key_name;
        }

        /**
           @운영       : 5581401
           @스테이지   :  5562515 ( 운영 / 스테이지 동일하게 변경됨 : 20170926 )
        */
        this.dispNo = function( real ){
            //return ( real || location.href.indexOf('m.ellotte.com') != -1) ? '5562515' : '5581401';  //20170926 사용 안함
            return "5581401";
        }
        this.localhost = location.href.indexOf('ellotte.com') != -1 ? false : true;

        /**
         홈탭(메인전용) 백화점 라이브 전용
         @param :
         @return :
         */
        var d_init = $q.defer();
        this.storeLiveShow = function(){
            d_init.resolve(true);
        }
        this.getStoreLiveInit = function(){
            return d_init.promise;
        }

        this.addZero = function( n ) {
            return n < 10 ? '0'+n : n;
        }

        /**
         * storeliveData
         */
        this.storeLiveLocalStorage = {
            clear: function(name){
                localStorage.removeItem( name || 'storeliveData')
            },
            get : function(name){
                return localStorage.getItem( name || 'storeliveData' )
            },
            set : function(data,name){
                localStorage.setItem( name || 'storeliveData',JSON.stringify(data))
            }
        }
        this.storeLiveSessionStorage = {
            clear: function(name){
                sessionStorage.removeItem( name || 'storeliveData')
            },
            get : function(name){
                return sessionStorage.getItem( name || 'storeliveData')
            },
            set : function(data, name){
                sessionStorage.setItem( name || 'storeliveData',JSON.stringify(data))
            }
        }

        this.msg = {
            load : {
                complete : '',
                error : '',
                loading : '데이타를 불러오고 있습니다.\n잠시후에 다시 시도해 주세요.',
            }
        }

        this.cacheMode = true;
    }])

    /**
        [백화점 라이브]
        @PRODUCT LIST
        Attritues
            @[sort-click] sortClick : 인기, 최신 클릭시 실행(callback)될 함수
            @[load-func] loadFunc : 내부 로드함수 실행
            @[product-key-name] productKeyName : 'main'(엘롯데메인), 'sub'(서브페이지), 'brand'(브랜드메인)
     */
    .directive( 'storeLiveProductList', [ '$http', 'storeliveService','storeliveApi','LotteCommon', '$rootScope', 'productLink', 'storeLiveTmpl', 'storeliveTiclick', 'scrollMore', 'prdTmplList', '$compile', '$timeout', '$templateCache',
        function( $http, storeliveService,storeliveApi,LotteCommon,$rootScope, productLink, storeLiveTmpl, storeliveTiclick, scrollMore, prdTmplList, $compile, $timeout, $templateCache ){
        return {
            restrict:'E',
            templateUrl : storeLiveTmpl,
            scope:{ sortClick:'=', loadFunc:'=?', storeliveData:'=storeliveData', productKeyName:'@', templateType:'@' },
            link : function( scope, el ){

                scope.productElements = el;
                var productKeyName = storeliveService.getProductKeyName(),
                    dataName = 'storeliveProductList',
                    pageOption = {
                        listCnt : 20,
                    }, unitLoaded = false;

                /**
                 * 백화점라이브 서브페이지로 이동
                 * @param item
                 * @param type
                 * @param index
                 */
                scope.publicLinkFunc = function( item, type, index, best_flasg ) {
                    if( type ) productLink.ProdLink( item, type, index, best_flasg );
                    else goBrandMain( item, index );
                }

                /**
                 * 브랜드메인으로 이동
                 * @param item
                 * @param index
                 * @param rc_type
                 */
                function goBrandMain( item, index, rc_type ) {
                    productLink.ProdLink( {
                        rank_type : rc_type,
                        elliv_shop_sn : item.elliv_shop_sn,
                        tclick : storeliveTiclick.shop + item.brnd_no
                    }, "shop_rnk", index );
                }

                /**
                 * 목록 정렬
                 * @type {[object]}
                 */
                scope.sortChange = function(i){
                    if(storeliveService.Observers.productLoading.getValue()) {
                        alert( storeliveService.msg.load.loading );
                        return;
                    }
                    scope.storeliveData.sort = scope.storeliveData.alignOptoins[i].value;
                    // 목록 초기화
                    scope.resetProdctList();
                    if( scope.storeliveData.totalPage > 0 && scope.storeliveData.page >= scope.storeliveData.totalPage ) scope.storeliveData.end = true;
                    scope.getMoreData();
                    getScope().sendTclick( storeliveTiclick.prod_list_sort + storeliveService.addZero( i+1 ) );

                    // ? 클릭시 오픈된 레이어 닫기
                    scope.showHepl_state = false;
                };

                scope.resetProdctList = function(){
                    scope.storeliveData.page = 0;
                    scope.storeliveData.end = false;
                    scope.storeliveData.goods_list = [];
                }

                /**
                 * 데이터 갱신
                 * @type {Array}
                 */
                storeliveService.Observers.storeliveProductList.get().then(null,null,
                function(res) {
                    if( !res ) return;
                    if(!scope.storeliveData.goods_total_count) {
                        scope.storeliveData.goods_total_count = res.goods_list.elliv_goods_cnt;
                        // 총 페이지
                        scope.storeliveData.totalPage = Math.ceil( scope.storeliveData.goods_total_count/pageOption.listCnt );
                        if( scope.storeliveData.page >= scope.storeliveData.totalPage ) scope.storeliveData.end = true;
                        else scope.storeliveData.end = false;
                    }
                    if(!scope.storeliveData.page) scope.storeliveData.page = 1;

                    // 로딩 중지
                    storeliveService.Observers.productLoading.set(false);

                    var currentList = res.goods_list.elliv_goods_list.items || [];

                    // 품절상품 삭제
                    if( currentList.length ) {
                        for( var i=0; i<currentList.length; ++i ) {
                            if( currentList[i].elliv_goods ) {
                                if( currentList[i].elliv_goods.is_sold_out ) {
                                    currentList.splice( i, 1 );
                                }
                            }
                            /* 랭킹 순서가 꼬이기 때문에 상품 랭킹은 필터하지 않음
                            if( currentList[i].goods_rnk ){
                                if( currentList[i].goods_rnk.elDptsGoodsRankItem ) {
                                    var rnk_item = currentList[i].goods_rnk.elDptsGoodsRankItem.items || [];
                                    if( rnk_item.length ) {
                                        for( var s=0; s<rnk_item.length;++s) {
                                            if( rnk_item[s].is_sold_out ) {
                                                rnk_item.splice(s,1);
                                            }
                                        }
                                    }
                                }
                            }
                            */
                        }
                    }

                    // 로드된 페이지가 설정된 리스트 개수 보다 적거나
                    // 현재 페이지가 총 페이지수와 같으면 end 처리
                    if( currentList.length && currentList.length < pageOption.listCnt ||
                        scope.storeliveData.page >= scope.storeliveData.totalPage ) {
                        scope.storeliveData.end = true;
                    }

                    // 서브유닛일경우 elliv_goods만 사용
                    if( scope.templateType != "storeLivemain" ) {
                        var subItems = [];
                        for( var sb=0; sb<currentList.length; sb++ ){
                            if( currentList[sb].disp_type == "elliv_goods" ) {
                                subItems.push( currentList[sb] );
                            }
                        }
                        if( subItems.length ) currentList = subItems;
                    }

                    // 추가 데이터가 없으면 종료
                    if( !currentList.length ) return;
                    var addList = [],
                        old = scope.storeliveData.goods_list;
                    try {
                        addList = old.concat(currentList);
                        // 목록 갱신
                        if(addList.length) scope.storeliveData.goods_list = addList;
                    } catch (e) {
                        console.log('상품목록 로드 에러', res)
                    }
                });

                /**
                 * 최신, 인기 ( 데이터 정렬 )
                 * @param value
                 */
                scope.setSort = function( value ) {
                    scope.storeliveData.sort = value;
                    if( scope.sortClick && typeof scope.sortClick == 'function' ) {
                        scope.sortClick( scope.storeliveData.sort );
                    }
                };

                /**
                 * 스크린 타입과 필수 파라미터 확인
                 */
                scope.getMoreData = function(){
                    if( scope.storeliveData.end || storeliveService.Observers.productLoading.getValue() ) return;
                    scope.storeliveData.page++;

                    var cate = storeliveService.Observers.category.getValue();
                    // 메인은 파라미터값이 필수
                    if( !productKeyName || !cate ) {
                        console.log( '[getMoreData] 카테고리 데티터가 없음' );
                        return;
                    }

                    scope.getProductList({
                        cate_no: cate.disp_no,
                        //tag_sn: category.tag_sn,
                        tag_sn: storeliveService.Observers.tag_sn.getValue(),
                        screen_type: productKeyName,
                        page: scope.storeliveData.page,
                        sort: scope.storeliveData.sort,
                        elliv_shop_sn: cate.elliv_shop_sn
                    });
                };

                /**
                 * 데이터 로드
                 * @param params
                 */
                scope.getProductList = function( params ) {
                    if( !params.disp_no || !params.screen_type ) {
                        // 로딩 표시
                        storeliveService.Observers.productLoading.set(true);
                        // 데이터 로드
                        storeliveApi({
                            url: LotteCommon.prodListData,
                            data: params,
                            dataName: dataName
                        });
                    } else {
                        console.log( '[storeLiveProductList] : [ERROR] > 페이지네임(main,sub,brand)가 없거나, 필수 파라미터 값이 없음');
                    }
                };

                /**
                 * 스크린타입명 비동기 갱신
                 */
                storeliveService.getProductKeyName().then(function(res){
                    productKeyName = res || 'main';
                });

                if( scope.loadFunc && typeof scope.loadFunc == 'function' ) {
                    scope.loadFunc = scope.getProductList;
                }

                /** # html로드 이슈로 diretiveHTML에 유닛 포함
                 * 템플릿 HTML로드
                 * 20170927 미사용으로 변경 ( html에 포함 )
                 *
                prdTmplList( scope.templateType ).then(function(tmplContent){
                    if(!tmplContent) {
                        console.log( '메인 템플릿 로드오류' );
                        return;
                    }
                    angular.element( el )
                        .find('.product_list_unit_container')
                        .html( $compile(tmplContent)(scope.$new()) );
                    unitLoaded = true;
                    console.log( '메인 템플릿 HTML ',tmplContent)
                },function(er){
                    console.log( '[PRODUCT 템플릿 유닛 타입값이 없음', scope.templateType, er );
                });
                */
                unitLoaded = true; // 유닛로드 설정변경으로 true 고정

                /**
                 * 스크롤 페이징
                 * directive로 변경필요 ( 다른탭으로 이동시에도 스크롤 이벤트 발생 )
                 */
                scrollMore().then(null,null,function(res){
                    var loading = storeliveService.Observers.productLoading.getValue();
                    if( !unitLoaded || scope.storeliveData.end || loading || !scope.storeliveData.totalPage ) return;
                    scope.getMoreData();
                });

                /**
                 * ? 버튼 클릭
                 */
                scope.showHepl_state = false;
                scope.showHepl = function(){
                    scope.showHepl_state = !scope.showHepl_state;
                }

                /**
                 * 카테고리 변경시마다
                 */
                storeliveService.Observers.category.get().then( null, null, function(res){
                    if( !res || res.trigger ) return;
                    scope.resetProdctList();
                    scope.getMoreData();
                });

                /**
                 * 카테고리 태그 갱신될때 마다 데이터 로드
                 */
                storeliveService.Observers.tag_sn.get().then(null,null,function(res){
                    if(!res) return;
                    scope.resetProdctList();
                    scope.getMoreData();
                });
            }
        }
    }])

    .factory( 'scrollMore', [ '$q', function( $q ){
        return function(){
            var d = $q.defer(), footH = angular.element("#footer").innerHeight();
            window.onscroll = function(e){
                var scrollTop = angular.element(window).scrollTop(),
                    contentsH = angular.element(".product_wrap").innerHeight() - footH,
                    wh = window.innerHeight;
                if( scrollTop > contentsH - wh ) d.notify( [ scrollTop, contentsH ] );
            }
            return d.promise;
        }
    }])

    /**
     * [상품위시] Directive
     */
    .directive( 'storeWishItem', [ 'storeliveService', 'storeliveApi', 'LotteUtil', 'LotteCommon', 'goodsWish', 'storeliveTiclick',
        function( storeliveService, storeliveApi, LotteUtil, LotteCommon, goodsWish, storeliveTiclick ){
        return function (scope) {
            scope.addStoreGdoosWish = function( item, idx ){
                if( item.has_wish ) {
                    alert( '이미 찜을 하셨습니다' );
                } else {
                    goodsWish(item,this).then(function(res) {
                        //console.log('처리완료 :: ' + res );
                        //console.log(res);
                        if (res) {
                            //console.log('storelive_wish 완료');
                            item.has_wish = true;
                            getScope().openCireleSystemAlert({type:"wishPop"});
                        }
                        getScope().sendTclick( item.tclick || storeliveTiclick.prod_sub_wish + item.disp_no + "_Clk_Wsh" );
                    }, function (er) {
                        //console.log('storelive_wish 실패', er );
                        try{ // 에러메세지 출력
                            alert( er.responseJSON.error.response_msg );
                        } catch(e){}
                    })
                }
            }
        }
    }])

    /**
     * 위시리스트 추가
     * 공통위시에 등록 후 -> 백화점 라이브 전용 위치에 추가
     *
     * 수정 : 20171020
     * 공통위시, 백화점 라이브 위시 2곳중 한 곳이 이미 등록되어 있는
     * 상황에서 나머지 한 곳이 등록되면 정상처리
     * 2곳다 등록되어 있으면 중복 메세지 출력
     */
    .factory('goodsWish', [ 'LotteUtil', 'LotteCommon', '$q', 'storeliveApi', 'storeliveTiclick',
        function( LotteUtil, LotteCommon, $q, storeliveApi, storeliveTiclick) {
        return function( item, scope ) {
            var d = $q.defer(), self = this;
            if(!self.RS) self.RS = LotteUtil.getAbsScope(scope);
            if (!self.RS.loginInfo.isLogin) { /*로그인 안한 경우*/
                alert('로그인 후 이용하실 수 있습니다.');
                self.RS.loginProc();
                d.reject(false);
            } else {
                self.RS.sendProductWish(item.goods_no, function (res, resData) {
                    //console.log( '[상품위시 공통소스 처리 결과]', res, resData );
                    if( !resData.error ) resData.error = {};
                    if (resData.result_status == 'success' || resData.error.response_code == 5002) {
                        //getScope().sendTclick( storeliveTiclick.prod_wish ); // 상품공통 20171023 변경됨 사용안함
                        storeliveApi({
                            url: LotteCommon.storeLiveProductWish,
                            data: {
                                cate_no: item.disp_no,
                                dpts_liv_goods_no: item.dpts_liv_goods_no,
                                goods_no: item.goods_no
                            }
                        }).then(function (finish) {
                            //console.log( 'finish', finish );
                            // 공통과, 백화점 라이브에 같이 등록되어 있으면 중복 메세지 출력
                            if( resData.error.response_code == 5002 && finish.error.response_code == 5002 ) {
                                d.reject(false);
                                try{ // 에러메세지 출력
                                    alert( finish.error.response_msg );
                                } catch(e){}
                            } else {
                                if (finish.result_status == 'success' || finish.error.response_code == 5002) {
                                    d.resolve(true);
                                    //console.log('[StoreLive_Wish] 추가완료', finish);
                                }
                                else {
                                    d.reject(false);
                                    //console.log('[StoreLive_Wish] 추가실패!!', finish);
                                }
                            }
                        },function (er) {
                            console.log('[StoreLive_Wish] ERROR', er);
                            // 공통과, 백화점 라이브에 같이 등록되어 있으면 중복 메세지 출력
                            if( resData.error.response_code == 5002 && er.responseJSON.error.response_code == 5002 ) {
                                d.reject(false);
                                try{ // 에러메세지 출력
                                    alert( er.responseJSON.error.response_msg );
                                } catch(e){}
                            } else {
                                // 백화점 라이브 위시에는 이미 등록되어 있으면 정상처리
                                if (er.responseJSON.result_status == 'success' || er.responseJSON.error.response_code == 5002) {
                                    d.resolve(true);
                                }
                                else {
                                    d.reject(false);
                                    try { // 에러메세지 출력
                                        alert(er.responseJSON.error.response_msg);
                                    } catch (e) {}
                                }
                            }
                        });
                    } else {
                        try {  // 에러메세지 출력
                            if(resData.error.response_msg) {
                                alert(resData.error.response_msg);
                            }
                        } catch(e) { console.log('오류 메세지출력 에러 ', resData) }
                    }
                });
            }
            return d.promise;
        }
    }])

    /**
     * [매장 찜]
     */
    .factory('shopWish', [ 'LotteCommon', '$q', 'storeliveApi',
        function( LotteCommon, $q, storeliveApi) {
        return function( item ) {
            var d = $q.defer();
            if( item ) {
                storeliveApi({
                    url: LotteCommon.storeliveStoreWish,
                    data: {elliv_shop_sn: item.elliv_shop_sn}
                }).then(function (res) {
                    if (res.result_status == 'success') {
                        d.resolve(res);
                        //console.log('[Store_Wish] 추가완료', res);
                    }
                    else {
                        d.reject(res);
                        //console.log('[Store_Wish] 추가실패!!', res);
                    }
                }, function (er) {
                    d.reject(er);
                    //console.log('[Store_Wish] ERROR', er);
                });
            } else {
                d.reject(null);
            }
            return d.promise;
        }
    }])

    /**
     * [샵 매니저 찜]
     */
    .factory( 'shopMasterLike', [ 'LotteCommon', '$q', 'storeliveApi',
        function( LotteCommon, $q, storeliveApi) {
        return function( item ) {
            var d = $q.defer();
            if( item ) {
                storeliveApi({
                    url: LotteCommon.storeliveShopMasterWish,
                    data: {
                        elliv_shop_sn: item.elliv_shop_sn,
                        shop_aemp_seq : item.shop_aemp_seq
                    }
                }).then(function(res) {
                    if (res.result_status == 'success') {
                        d.resolve(res);
                        console.log('[Store_Wish] 추가완료', res);
                    }
                    else {
                        d.reject(res);
                        console.log('[Store_Wish] 추가실패!!', res);
                    }
                }, function (er) {
                    d.reject(er);
                    console.log('[Store_Wish] ERROR', er);
                });
            } else{
                d.reject(null);
            }
            return d.promise;
        }
    }])

    /**
     * 공유하기
     */
    .factory( 'snsShare', [ function(){
        return function( obj ){
            var snsFunc = getScope().showSharePop || angular.element("body").scope().showSharePop;
            obj.noCdnUrl = location.href;
            // 티클릭
            if(obj.tclick) getScope().sendTclick( obj.tclick );
            // 공유팝업
            snsFunc( obj );
        }
    }])

    /**
     * [ 유틸 컨트롤러 ] 공통
     */
    .controller('utilsCtrl', [ '$scope', 'shopWish', 'goodsWish', 'shopMasterLike', '$q', 'snsShare', 'storeliveTiclick',
        function( $scope, shopWish, goodsWish, shopMasterLike, $q, snsShare, storeliveTiclick ){
        /**
         * 매장찜
         * @param item
         */
        $scope.storeWish = function( item ){
            var d = $q.defer();
            if(item) {
                shopWish( item )
                .then(function(res){
                    item.shop_rgl_cust_cnt++;
                    d.resolve(true)
                    getScope()
                    .sendTclick( storeliveTiclick.brand_store_wish );
                },function(err) {
                    d.reject(false);
                    if(er.error.response_msg) {
                        alert(resData.error.response_msg);
                    }
                });
            } else {
                d.reject(false);
            }
            return d.promise;
        }

        /**
         * 샵 매니저 찜
         * @param item
         */
        $scope.shopMasterLike = function( item ) {
            var d = $q.defer();
            if(item) {
                shopMasterLike( item )
                .then(function(res){
                    item.shop_aemp_rgl_cust_cnt++;
                    var seq = item.shop_aemp_seq<10?"0"+item.shop_aemp_seq:item.shop_aemp_seq;
                    getScope()
                    .sendTclick( storeliveTiclick.best_shop_manager + ( item.tlickIndex || seq ) );
                    d.resolve(true)
                },function(err){
                    console.log( '매장찜 실패', err);
                    //alert( '이미 찜을 하셨습니다.');
                    d.reject(false);
                    if(er.error.response_msg) {
                        alert(resData.error.response_msg);
                    }
                })
            } else {
                d.reject(false);
            }
            return d.promise;
        }
        // 공유하기
        $scope.shareFunc = snsShare;
    }])

    /**
     * [서브유닛] 핀터레스트
     */
    .directive( 'hwPinterRest', [ '$timeout', function( $timeout ){
        return {
            link : function(scope, el, attrs) {
                var align = 2,
                    w = window.innerWidth, // 윈도우 넓이
                    reload = attrs.reload == "true" ? true : false, // 개별 이미지가 로드 되었을때 정렬 초기화 여부
                    resize = attrs.resize == "true" ? true : false, // 화면 리사이징이 정렬 초기화 여부
                    puzzle = attrs.puzzle == "true" ? true : false; // false일경우 순차정렬

                function reflash () {
                    var container = el,
                        units = el.children();
                    return { container:container, units:units };
                }

                /**
                 * 이미지 로드완료 되었을때 재 정렬
                 * @param img
                 */
                scope.imgonloaded = function(img) {
                    if(!reload) return;
                    if( angular.element(img).attr('success') ) return;
                    angular.element(img).attr('success',1);
                    newAlign();
                };

                /**
                 * 정렬
                 * @param t
                 */
                scope.setAlign = function( t, realign ){
                    var width = window.innerWidth;
                    if( width < 1600 ) align = 4;
                    if( width < 1000 ) align = 3;
                    if( width < 600 ) align = 2;
                    var x = Math.ceil(width/align);
                    if(!t) return;

                    $timeout(function(){
                        var cont_el = reflash(),
                            container = cont_el.container,
                            units = cont_el.units,
                            cont_h = 0,
                            cpos_arr = [];
                        
                        if( puzzle ) {
                            angular.forEach(units, function (e, c) {
                                var item = angular.element(e), v = c % align, y = 1;
                                var pox = x * v;

                                item.css({width: x-1}); // [20171206] 리사이징시 정확한 이미지 높이값 체크를 위해 넓이값 먼저 적용
                                var itemheight = Math.ceil(e.clientHeight);

                                if(c>align) {
                                    var heights = [],
                                        minHeight = 0,
                                        maxHeight = 0,
                                        finish = false;
                                    for (var d = 0; d < cpos_arr.length; ++d) {
                                        heights.push(cpos_arr[d][0]);
                                    }

                                    minHeight = Math.min.apply(null, heights);
                                    maxHeight = Math.max.apply(null, heights);
                                    var isHigh = Math.abs( minHeight - maxHeight );
                                    // 이미지 사이즈가 같은데 전체 높이값이 1~2픽셀 정도 차이가 나면 높은 값으로 적용
                                    if( cpos_arr[0][2] == cpos_arr[0][2] && (isHigh > 0 && isHigh < 2) ) minHeight = maxHeight;
                                    for (var i = 0; i < cpos_arr.length; ++i) {
                                        if (!finish && minHeight == cpos_arr[i][0]) {
                                            y = Math.ceil(minHeight);
                                            v = i;
                                            pox = Math.ceil( x * i);
                                            finish = true;
                                        }
                                    }
                                }
                                else {
                                    try {
                                        y = Math.ceil(units[c - align].offsetTop + units[c - align].clientHeight);
                                    }
                                    catch(e) {
                                        //console.log('[error : y ]', "index : " + c );
                                    }
                                }

                                var imgH = item.find('figure img')[0].clientHeight;
                                item.css({width: x-1, left: pox, top: y});
                                cpos_arr[v] = [ y+itemheight, c, imgH, itemheight ];

                                if (item.find('img')[0].complete) {
                                    item.attr('success', 1);
                                }
                                if (y && cont_h < Math.ceil(y + itemheight)) cont_h = Math.ceil( y + itemheight );
                            });
                        }
                        else {
                            angular.forEach( units, function(e,c){
                                var item = angular.element(e), v = c%align, y = 0;
                                try{ y = units[c-align].offsetTop + units[c-align].clientHeight }
                                catch(e){ }
                                item.css({width:x,left:x*v,top:y});
                                if( item.find('img')[0].complete ) item.attr('success', 1);
                                if( y && cont_h < (y+e.clientHeight) ) cont_h = y+e.clientHeight;
                            });
                        }
                        container.css( { height:cont_h } );
                    });
                };

                /**
                 * 리사이징시 재 정렬
                 */
                if(resize){
                    window.onresize = function(e){
                        // 넓이값이 변경되었을때만
                        if( parseInt(w) == parseInt( window.clientWidth ) ) return;
                        w = window.clientWidth;
                        newAlign();
                    }
                }

                function newAlign(){
                    scope.setAlign( reflash().container.length );
                }

                // 목록이 업데이트될 때 마다 재 정렬
                scope.$watch(
                    function() { return el[0].childNodes.length; },
                    function( n, o) {
                        if( n !== o ) scope.setAlign( el.children().length );
                    }
                )
            }
        }
    }])

    /**
     * 카테고리 중앙 처리
     */
    .directive('sliderAutoCenter', [ 'storeliveService', '$timeout', function(storeliveService,$timeout){
        return function(scope, e, attrs )
        {
            if( !attrs.observer ) return;

            e.css({
                '-webkit-transition':'transform 300ms',
                '-moz-transition':'transform 300ms',
                '-o-transition':'transform 300ms',
                '-ms-transition':'transform 300ms',
                'transition':'transform 300ms'
            });

            function select(res){
                if( typeof res != 'number' ) return;
                var w = window.innerWidth,
                    t = e.children()[res],
                    x = t.offsetLeft,
                    itemW = t.clientWidth,
                    newX = -x + w/2 - itemW/2,
                    ew = e[0].clientWidth;

                if( ew < w ) return;
                if( newX > 0 ) newX = 0;
                if( newX < -(e[0].clientWidth-w) ) newX = -(e[0].clientWidth-w);

                setTimeout(function(){
                    e.css(setPosX(newX));
                },300);
            }

            function setPosX( x ) {
                return {
                    '-webkit-transform':'translateX('+x+'px)',
                    '-moz-transform':'translateX('+x+'px)',
                    '-o-transform':'translateX('+x+'px)',
                    '-ms-transform':'translateX('+x+'px)',
                    'transform':'translateX('+x+'px)'
                }
            }

            $timeout(function(){
                if( typeof storeliveService.Observers[attrs.observer].getValue() == 'number' ) {
                    select( storeliveService.Observers[attrs.observer].getValue() );
                }
            },1000);
            storeliveService.Observers[attrs.observer].get().then(null,null,select);
        }

    }])

    /**
     * [ 브랜드 리스트 ]
     */
    .directive( 'storeLiveBrandList', [ 'productLink', 'shopMasterLike', 'storeliveService','storeliveApi', 'LotteCommon', '$timeout', 'storeliveTiclick',
        function( productLink, shopMasterLike, storeliveService, storeliveApi, LotteCommon, $timeout, storeliveTiclick ) {
        return {
            restrict: 'E',
            scope : { },
            templateUrl : '/ellotte/resources_dev/main/template/storelive_brand_list.html',
            link : function( scope, el ) {

                var brandlistObject = {},
                    currentStore = storeliveService.storeLiveSessionStorage.get('liveUseStore'),
                    currentBrand = storeliveService.storeLiveSessionStorage.get('liveUseStoreBrand');
                scope.storeList = [];
                scope.brandList = {};
                scope.listData = [];
                scope.currentActive;

                /**
                 * 지점 클릭
                 * @param item
                 * @param index
                 */
                scope.currentBrandList = function( item, index, init ){
                    if(!item) return;
                    scope.brandList = sorting( brandlistObject[item.entr_contr_no], 'brnd_nm' );
                    scope.currentActive = item.entr_contr_no;

                    item.clickIndex = index;
                    storeliveService.storeLiveSessionStorage.set(item,'liveUseStore');

                    // 티클릭
                    if(!init) getScope().sendTclick( storeliveTiclick.brand_list_store + storeliveService.addZero( index +1 ) );
                };

                /**
                 * 브랜드 클릭
                 * @param item
                 */
                scope.goStore = function( item, index, noLink ){
                    // 티클릭
                    var tc = storeliveTiclick.brand_list_brand + "_"+ item.brnd_no;
                    item.tclick = tc;
                    item.clickIndex = index;
                    scope.bl_brnd_no = item.brnd_no;
                    storeliveService.storeLiveSessionStorage.set(item,'liveUseStoreBrand');
                    if(!noLink) productLink.ProdLink( item ,'shop_rnk', index );
                }

                /**
                 * 브랜드레이어 열고, 닫기
                 */
                storeliveService.Observers.brandListState.get().then(null,null,onBrandLayerState);
                function onBrandLayerState ( state ) {
                    if( !scope.brandList.length ) {
                        console.log( '등록된 브랜드가 없습니다.' );
                        return;
                    };
                    if( state ) { // open
                        // 티클릭
                        getScope().sendTclick(storeliveTiclick.brand_list_open);
                        if( !angular.element(el).hasClass('active') ){
                            angular.element(el).addClass('active');
                            angular.element("body").addClass('noScroll');
                            angular.element(el).find('.background_layer').addClass('active');
                            $timeout(function(){
                                angular.element(el).find(".storelive_brand_list").addClass('active');
                            },300);
                            $timeout(function(){
                                angular.element(el).find(".brand_list_close").addClass('active');
                                angular.element("#wrapper").css({height:"100%"});
                            },600);
                        }
                    } // close
                    else {
                        angular.element("#wrapper")[0].removeAttribute('style');
                        if( angular.element(el).hasClass('active') ) {
                            angular.element(el).find(".brand_list_close").removeClass('active');
                            $timeout(function(){
                                angular.element(el).find(".storelive_brand_list").removeClass('active');
                            },200);
                            $timeout(function(){
                                angular.element(el).find('.background_layer').removeClass('active');
                            },400);
                            $timeout(function(){
                                angular.element(el).removeClass('active');
                                angular.element("body").removeClass('noScroll');
                            },600);
                        }
                    }
                }
                scope.brandClose = function(){
                    storeliveService.Observers.brandListState.set(false);
                };

                storeliveApi({
                    url : LotteCommon.storeLiveBrandListData
                }).then(function(res){
                    var brandData = [], stores = [];
                    try { brandData = res.brnd_top.brand_list.items }
                    catch(e) { console.log('브랜드 목록 데이터가 없음') };

                    // 지점별 매장
                    if( brandData.length ) {
                       for( var i=0; i<brandData.length; ++i ) {
                           if( !brandlistObject[brandData[i].entr_contr_no] ) brandlistObject[brandData[i].entr_contr_no] = [];
                           if( brandlistObject[brandData[i].entr_contr_no] ) brandlistObject[brandData[i].entr_contr_no].push( brandData[i] );
                       }
                    };

                    // 지점 목록
                    for( var i in brandlistObject ) {
                       stores.push({
                           entr_contr_no:brandlistObject[i][0].entr_contr_no,
                           elliv_shop_sn:brandlistObject[i][0].elliv_shop_sn,
                           brnd_no:brandlistObject[i][0].brnd_no,
                           brch_nm:brandlistObject[i][0].brch_nm
                       })
                    };
                    scope.listData = brandData;
                    scope.storeList = sorting( stores, 'brch_nm' );
                    var headShop = null;
                    var ilsanShop = null;
                    var daeguShop = null; 

                    /*2018-01-03 지점노출 우선순위 요건 추가 :  
                    본점 , 일산점 ,대구점 이 우선 순위 지점 .해당 지점이 있을경우  각 본점 > 일산점 > 대구점 순으로 정렬후 나머지 ㄱ ㄴ ㄷ 정렬 */
                   for( var i=scope.storeList.length-1; i >= 0;i-- ) { 

                        switch(scope.storeList[i].entr_contr_no){

                            case 20 :  headShop = angular.copy(scope.storeList[i]); scope.storeList.splice(i,1);//본점               
                                        break;
                            case 111157 : ilsanShop = angular.copy(scope.storeList[i]); scope.storeList.splice(i,1);//일산점
                                        break;
                            case 110551 : daeguShop = angular.copy(scope.storeList[i]); scope.storeList.splice(i,1);//대구점
                                        break;
                            default :
                            
                               break;
                        break;
                        }                     
                    }

                    if( daeguShop ) scope.storeList.unshift(daeguShop); //대구점
                    if( ilsanShop ) scope.storeList.unshift(ilsanShop); //일산점
                    if( headShop ) scope.storeList.unshift(headShop); //본점
                    autoSelect();
                });

                // 내림차순 ( ㄱㄴㄷ, abc )
                function sorting ( arr, key ) {
                    return arr.sort( function(a,b){
                        return a[key] < b[key] ? - 1 : a[key] > b[key] ? 1: 0;
                    });
                };

                function autoSelect ( ){
                    if( !scope.storeList.length ) return;
                    if(!currentStore) scope.currentBrandList( scope.storeList[0], 0, true );
                    else {
                        // 지점 선택
                        currentStore = JSON.parse(currentStore);
                        scope.currentBrandList( currentStore, currentStore.clickIndex, true );
                        // 브랜드 선택
                        if( currentBrand ) {
                            currentBrand = JSON.parse(currentBrand);
                            scope.goStore( currentBrand, currentBrand.clickIndex, true );
                        }
                    }
                };

            }
        }
    }])

    /**
     * 페이지 로딩
     */
    .directive('storeLivePageLoading',[ 'storeliveService', function( storeliveService ){
        return {
            template: "<div ng-if='storelivePageLoading' class='storelive_page_loading'><span class='loading half'></span></div>",
            link : function( scope ) {
                scope.storelivePageLoading = storeliveService.Observers.pageloading.getValue();
                storeliveService.Observers.pageloading.get().then(null,null,
                function(res){
                    if(typeof res != 'boolean') return;
                    scope.storelivePageLoading = res;
                });
            }
        }
    }])

})();