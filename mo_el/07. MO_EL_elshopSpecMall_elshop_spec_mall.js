var menuSlide = null; /*슬라이드 Plug-in*/

(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteCommFooter',
        'lotteUnit',
        'lotteSlider',
        'lotteNgSwipe'
    ]);
    
    /*
      전문관 메인 컨트롤러
    */
    app.controller('ElshopSpecMallCtrl', ['$http', '$scope',  'LotteCommon', 'commInitData', 'LotteUtil', '$location','$window','$timeout',
    function($http, $scope, LotteCommon, commInitData, LotteUtil, $location,$window, $timeout)
    {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.isbuyState = false;
        $scope.tclickCode = "";
        $scope.specMallDispNo; // 매장코드
        $scope.cornerHtml = ''; //몽블랑 html 받는코드 
        
        $scope.elShop = {
            dispNo : commInitData.query.dispNo,
            curDispNo : "",
            preview: commInitData.query.preview
        };

        // 로컬 테스트
        var localTest = false;
        if( ( window.location.href.indexOf(".lotte.com") > -1 ) || ( window.location.href.indexOf(".ellotte.com") > -1 ) ) {
          localTest = false;
        } else {
          localTest = true;
        }
        
        localTest = false;
        
        // 헤더 클릭시 전문관 메인으로 이동
        $scope.subheaderlinkURL;
        $scope.brandControl = function(c){
        	
        }
        
        /**
         * Data Load Scope Func
         */
        $scope.ctgData = { elshopMain:{} };
        $scope.loadCtgData = function ( params ) {
            var dataLoadURL =LotteCommon.specMallMainData;
            //console.log(dataLoadURL);
            if( localTest && params.dataType ) dataLoadURL+="."+params.dataType;
          
            $http.get(dataLoadURL, {
                withCredentials:false,
                params: { dispNo:$scope.elShop.dispNo, preview:$scope.elShop.preview, dataType:params.dataType }
            })
            .success(function(data) {
                if(!data) { return };
                
                $scope.specMallDispNo = data.elshopMain.disp_lrg_no;
                
                if (data.elshopMain.mainFreeHtmlBanners != null && data.elshopMain.mainFreeHtmlBanners  != undefined ) {
                   if (data.elshopMain.mainFreeHtmlBanners.items[0] != null && data.elshopMain.mainFreeHtmlBanners.items[0] !=undefined)
                	 {if (data.elshopMain.mainFreeHtmlBanners.items[0].html != null && data.elshopMain.mainFreeHtmlBanners.items[0].html !=undefined)
                	 {$scope.cornerHtml = data.elshopMain.mainFreeHtmlBanners.items[0].html.html;}}
                }
               
               
                if ($scope.cornerHtml == null || $scope.cornerHtml== undefined ){$scope.cornerHtml = "";}
                try{
                    /*
                    중복 안되게 데이터가 있는것 만 추가.
                    ( 20170802 ::  속도개선 데이터 분할 로드 키값은 모두 동일하게 가지고 있고 안에 데이터가 있고 없고의 차이 )
                    */
                    for( var i in data.elshopMain ) {
                        if( !$scope.ctgData.elshopMain[i] && data.elshopMain[i] ) {
                            var skeyCnt=0, notNull = false;
                            for( var s in data.elshopMain[i] ) {
                                if( s === "items" && s != null ) {
                                    if( !data.elshopMain[i][s] ) data.elshopMain[i][s] = [];
                                    if( data.elshopMain[i][s].length ) skeyCnt++;
                                    else notNull = true;
                                } else {
                                    if( ( data.elshopMain[i][s] && !notNull ) && (data.elshopMain[i][s]!=0 || data.elshopMain[i][s]!="0")  ) skeyCnt++;
                                }
                            }
                            if( skeyCnt ) {
                                // console.log( '## key_name', i, data.elshopMain[i] );
                                $scope.ctgData.elshopMain[i] = data.elshopMain[i];
                            }
                        }
                    }
                } catch(e) { console.log( 'error : ' + params.dataType )}

                if($scope.subTitle) $scope.subTitle = data.disp_nm;
                if($scope.tclickCode) $scope.tclickCode = data.elshopMain.disp_lrg_no;
                if($scope.subheaderlinkURL) $scope.subheaderlinkURL = LotteCommon.specMallMainURL + "?dispNo=" + $scope.tclickCode + "&" + $scope.baseParam + "&tclick=m_EL_SpeDisp-5570959_header_logo"

                try{ // 카테고리
                    if( data.elshopMain.cate_list.items.length ) { $scope.catData = $scope.nCatArr.setCatData( data.elshopMain.cate_list.items ); }
                } catch(e){ };

                try{  // 헤더 컬러
                    if($scope.ctgData.elshopMain.elshopMenuTheme) colorTheme();
                } catch(e){};

                $scope.dataLoadInit();
            })
            .error(function () {
                console.log( 'Data Error : 전문몰 데이터' );
            });
        };

        /*
            컬러값 필터 ( 컬로코드 or 백그라운드 이미지 )
            @param : color ( string )
            @param : object ( object )
            @return : string or object
        */
        function colorSourceFilter ( color, object ) {
            if(!color) return null;
            // 기본은 이미지
            var headCss = 'url('+color+')';
            // 컬러코드가 들어올경우
            if( color.indexOf('#') != -1 ) headCss = color;
            return object ? {background:headCss} : headCss;
        }

        /*
            헤더 및 카테고리 컬러값 변경
            @param :
            @return :
        */
        function colorTheme(){
            var colorTheme = $scope.ctgData.elshopMain.elshopMenuTheme || {},
                head = angular.element('#head_sub h2');
            // 헤더 컬러 적용
            try{ $scope.headerBackBackgroundColor = $scope.ctgData.elshopMain.mainTitleImgBanner.conts_desc_cont; }
            catch(e) {}
            // 카테고리 BG
            if( colorTheme.menuBackgroundColorMiddle ) {
                var bg2 = colorSourceFilter( colorTheme.menuBackgroundColorMiddle );
                $scope.menuBackgroundColorMiddle = bg2;
            }
            // 카테고리 BG
            if( colorTheme.menuBackgroundColorSmall ) {
                var bg2 = colorSourceFilter( colorTheme.menuBackgroundColorSmall );
                $scope.menuBackgroundColorSmall = bg2;
            }
            // 대카 컬러
            if( colorTheme.menuFontColorMiddle ) {
                $scope.menuFontColorMiddle = colorTheme.menuFontColorMiddle;
            }
            // 중카 컬러
            if( colorTheme.menuFontColorSmall ) {
                $scope.menuFontColorSmall = colorTheme.menuFontColorSmall;
            }
            //  활성화 컬러
            if( colorTheme.menuMouseOnColor ) {
                $scope.menuMouseOnColor = colorTheme.menuMouseOnColor;
            }
            //  헤더 버튼 블랙, 화이트 처리
            if( colorTheme.menuBackButtonColor ) {
                $scope.menuBackButtonColor = colorTheme.menuBackButtonColor;
                if( $scope.menuBackButtonColor == "white" ) angular.element('body').addClass('overlay');
            } else {
                angular.element('body').addClass('overlay');
            }
        }

        // 데이타로드 분할로 3번 로드
        var dataLoadList = [ 'top', 'middle', 'bottom' ];
        if( !dataLoadList ) { $scope.loadCtgData() }
        else {
            for( var i in dataLoadList ) $scope.loadCtgData({dataType:dataLoadList[i]});
        }
    }]);

    /*
      메인 컨테이너
    */
    app.directive('elshopContainer', ['$window', '$timeout', '$location', function($window, $timeout, $location) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/elshop_spec_mall_container.html',
            replace:true,
            link: function (scope,  el, attrs) {
                var $win = angular.element($window);
                
                function initHead(){
                    var headData = scope.ctgData.elshopMain.mainTitleImgBanner;
                    if( headData.img_url ) {
                        scope.subTitle = "<img src='"+headData.img_url+"' alt='"+headData.alt_cont+"'/>";
                    } else {
                      scope.subTitle = headData.banner_nm;
                    }
                    headConfig = true;
                }
                
                scope.dataLoadInit = function(){
                    try{ if( scope.ctgData.elshopMain.mainTitleImgBanner ) initHead() }
                    catch(e) {};

                    // 메인 상단배너
                    var mainTopBnnData, bnnType;
                    try{ // A Banner
                        if( scope.ctgData.elshopMain.mainTopABanners.items )
                            mainTopBnnData = scope.ctgData.elshopMain.mainTopABanners.items; bnnType = "A";
                    } catch(e){};
                    try{ // B Banner
                        if( scope.ctgData.elshopMain.mainTopBBanners.items )
                            mainTopBnnData = scope.ctgData.elshopMain.mainTopBBanners.items;  bnnType = "B";
                    } catch(e) {};

                    if( mainTopBnnData ){
                        scope.alias.topBann.type = bnnType;
                        scope.alias.topBann.data = mainTopBnnData;
                    }

                    try{ // 브랜드배너
                        if(!scope.alias.brandBnn.data)
                            scope.alias.brandBnn.data = scope.ctgData.elshopMain.mainBrandBanners.items;
                    } catch(e){};

                    try{ // 금주 신상품
                        if(!scope.alias.newProduct.data)
                            scope.alias.newProduct.data = scope.ctgData.elshopMain.mainNewProdBanners.items;
                    } catch(e){};

                    try{ // 기획전
                        if(!scope.alias.planShop.data )
                            scope.alias.planShop.data = scope.ctgData.elshopMain.mainPlanshopBanners.items;
                    } catch(e){};

                    try{ // hot한 신상품
                        if(!scope.alias.newHotProduct.data)
                            scope.alias.newHotProduct.data = scope.ctgData.elshopMain.mainNewHotProdBanners.items;
                    } catch(e){};

                    try{ // 핫 이슈 타이틀
                        if(!scope.alias.hotIssue.title)
                            scope.alias.hotIssue.title = scope.ctgData.elshopMain.mainHotIssueTitleBanners;
                    } catch(e){};

                    try{ // 핫 이슈 상품
                        if(!scope.alias.hotIssue.data )
                            scope.alias.hotIssue.data = scope.ctgData.elshopMain.mainHotIssueBanners.items;
                    } catch(e){};

                    try{ // 플러스 딜
                         if(!scope.alias.plusDeal.data )
                            scope.alias.plusDeal.data = scope.ctgData.elshopMain.mainDealPopularBanners.items;
                    } catch(e){};

                    try{ // 완벽한 스타일
                        if(!scope.alias.mdTip.data )
                            scope.alias.mdTip.data = scope.ctgData.elshopMain.mainMdTipBanners.items;
                    } catch(e){};

                    try{ // 특별한 이야기
                        if(!scope.alias.specialStory.data )
                            scope.alias.specialStory.data = scope.ctgData.elshopMain.mainSpecStoryBanners.items;
                    } catch(e){};

                    try{ // 공지사항
                        if(!scope.alias.notice.data )
                            scope.alias.notice.data = scope.ctgData.elshopMain.mainNoticeTextBanners.items;
                    } catch(e){};
                   
                    try {  // 공지사항 링크에서 tclick 삭제
                      if( scope.alias.notice.data && scope.alias.notice.data.length ) {
                        for( var i in scope.alias.notice.data ) {
                          var uparam = scope.alias.notice.data[i].text.link_url.split("&");
                          if( uparam.length ) {
                            for( var s in uparam ) {
                              if( uparam[s].indexOf("tclick") !=-1 || uparam[s].indexOf("tClick") != -1 ) {
                                uparam.splice(s, 1 );
                              }
                            }
                            var replaceURL = "";
                            for( var c in uparam ) replaceURL += (c>0 ? "&"+uparam[c] : uparam[c]);
                            if(replaceURL) scope.alias.notice.data[i].text.link_url = replaceURL;
                          }
                        }
                      }
                    } catch(e) {}
                }
                
                var dataObjectList = ["topBann", "brandBnn", "newProduct", "planShop", "newHotProduct", "hotIssue", "plusDeal", "mdTip", "specialStory", "notice"], alias = {};
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
                for( var i in dataObjectList ) { dataObjectController( dataObjectList[i] ); }
                scope.alias = alias;
            }
        };
    }]);

    /*
      메인 비주얼
    */
    app.directive('mainVisual',[function(){
        return {
          templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_visual.html',
          link :function( scope, el, attrs ) {
            scope.topBannAllshows = false;
            scope.brandIsAll = function(state){
              scope.topBannAllshows = state;
            }
          }
        }
    }]);

    // 메인 브랜드
    app.directive('mainBrand',[function(){
        return { templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_brand.html' }
    }]);
    // 금주의 신상품
    app.directive('mainWeekly',[function(){
        return { templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_weekly.html' }
    }]);
    // 메인 기획전
    app.directive('mainPlanshop',[function(){
        return { templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_planshop.html' }
    }]);
    // 핫 신상품
    app.directive('mainHotNew',[function(){
        return {  templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_hotnew.html' }
    }]);
    // 핫 이슈
    app.directive('mainHotIssue',[function(){
        return { templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_hotissue.html'  }
    }]);
    // 플러스 딜
    app.directive('mainPlusDeal',['$timeout',function($timeout){
        return {
          templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_plusdeal.html',
          link :function( scope, el, attrs ) {
              /*
                이미지 로드 에러시 해당 블록 삭제
                20170801 배포 가로형 이미지가 없을경 노출 안함
             */
              scope.removeItem = function( item) {
                  var rmID = angular.element(item).attr('itemID');
                  try{ $timeout( function(){ angular.element(rmID).remove() }, 100 ); } catch(e) {}
              }
          }
        }
    }]);
    // MD TIP
    app.directive('mainMdTip',[function(){
        return {  templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_mdtip.html' }
    }]);
    // 특별한 이야기
    app.directive('mainSpecialStory',[function(){
        return {  templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_specialstory.html' }
    }]);
    // 메인 공지
    app.directive('mainNotice', [function ($timeout, $location) {
        return {
            templateUrl : '/ellotte/resources_dev/mall/elshopSpecMall/contents/elshop_spec_mall_notice.html',
            link: function (scope, el, attrs)
            {
                scope.chnageNotice = function( str ){
                    var n = scope.alias.notice,
                        i = n.swipeIndex,
                        m = n.data.length;
                    if( str == "up" ) {
                      if( i<m-1 ) { i++; } else { i = 0;}
                    } else {
                      if( i> 0 ) { i--; } else { i = n.data.length-1; }
                    }
                    scope.alias.notice.swipeIndex = i;
                }
                scope.noticeLink = function( url, tclick, params ){
                  var no = scope.alias.notice.swipeIndex+1, nticlick = tclick + ( no+1 <10 ? '0'+no : no );
                  scope.randingURL( url, nticlick, params );
                }
            }
        };
    }]);

    /*
      전문몰 타이틀, 카테고리
    */
    app.directive('newSpecMallCtg', ['LotteCommon','commInitData','$timeout', function(LotteCommon,commInitData, $timeout) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/category/new_spec_mall_ctg_container.html',
            replace:true,
            link:function( $scope, el, attrs )
            {
                $scope.elshopCate = {
                    useCatinfo:{},
                    topBanner:{},
                    showAllCategory:false
                };
                $scope.headerHeight = "45"; /* 헤더 픽스 사이즈 */
                /* 카테고리 2n 그룹 만들기 */
                $scope.nCatArr =
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
                                    arr[c].depthIndex = c; // sequnce
                                    arr[c].groupIndex = i; // group sequnce
                                    arr[c].subIndex = s;
                                    sliceArr.push( arr[c] );
                                }
                            }
                            if(sliceArr.length) { n.push({s:sliceArr}); }
                        }
                        return n;
                    },
                    setCatData : function( data )
                    {
                        var n = angular.copy(data);
                        for( var i=0; i<data.length; ++i ) {
                            if( data[i].sub_cate_list&&data[i].sub_cate_list.length ) {
                                n[i].depthIndex=i;
                                n[i].sub_cate_list = $scope.nCatArr.getSubList( data[i].sub_cate_list );
                            }
                        }
                        return n;
                    }
                }

                $scope.zero = function( n ) {
                  return n<10?'0'+n:n;
                }

                 /*
                    카테고리 클릭
                    @param : catIs ( object )
                    @param : depth ( int )
                    @return
                */
                $scope.openCatList = function( catIs, depth )
                {
                    $scope.elshopCate.showAllCategory = false;
                    var catItem = angular.copy(catIs);
                    if( !catItem ) {
                        $scope.elshopCate.useCatinfo = {};
                        return;
                    }
                    // depth2 열기 닫기
                    for( var key in catItem ) {
                        if( catItem[key]!=null &&
                            catItem[key] == $scope.elshopCate.useCatinfo[key] &&
                            key.substr( key.length-1 ) == depth &&
                            key.indexOf("depth") != -1 ) {
                             catItem[key] = null;
                            try{ catItem["depth"+String( Number( key.substr( key.length-1 ))+1 )] = null }
                            catch(e) { }
                        }
                    }
                    // 2depth 열림
                    if( catItem.depth1 != null && depth == 1 ) {
                      $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1+1));
                    }
                    // 3depth 열림
                    if( catItem.depth1 != null && catItem.depth2 != null ) {
                      $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1+1)+"_"+$scope.zero(catItem.depth2+1));
                    }
                    $scope.elshopCate.useCatinfo = catItem || {};
                }

                /*
                    카테고리 닫기
                    @param :
                    @return :
                */
                $scope.closeCatList = function() {
                    $scope.elshopCate.useCatinfo = {};
                }

                /*
                    전체카테고리 열, 닫
                    @param :
                    @return :
                */
                $scope.showAllCategoryClick = function(){
                  $scope.elshopCate.useCatinfo = {};
                  $scope.elshopCate.showAllCategory = !$scope.elshopCate.showAllCategory;
                  if($scope.elshopCate.showAllCategory) {
                    $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_header_cate");
                  }
                }

                /*
                    서브카테고리 클릭
                    @param : i ( int )
                    @return
                */
                $scope.subCtgClick = function( i ){
                    $scope.showAllCategoryClick();
                    setTimeout( function() { angular.element("#elshopSubHead li:eq("+i+")").triggerHandler("click");  }, 100 );
                }

                /*
                    페이지연결
                    @param : url ( string )
                    @param : tclick ( string )
                    @param : customParams ( object )
                    @return
                */
               $scope.randingURL = function( url, tclick, customParams ) {
                 if(!url) { console.log('링크없음'); return; }
                 url = getUseLocalHost(url);
                  var params = "";
                  if( url.indexOf("?") != -1 ) {
                    params = "&tclick="+(tclick||"")+"&"+ getBaseParams();
                  } else {
                    params = "?tclick="+(tclick||"")+"&"+ getBaseParams();
                  }
                  
                  if( customParams ) { // 추가 파라미터 일괄 추가
                    for( var i in customParams ) if( customParams[i] ) params += "&"+i+"="+customParams[i];
                  }
                  
                  // 20170906 상세페이지에 필요한 파라미터 추가
                  if( url.indexOf('product_view.do') != -1 && url.indexOf('curDispNo') < 0 && params.indexOf('curDispNo') < 0  ) {
                	  params+="&curDispNo="+$scope.specMallDispNo;
                  }
                  location.href = url + params;
               }
               
               /*
                로컬 공통 URL용
                링크함수가 공통 함수 1개만 사용하기 때문에  이곳을 통해 로컬 링크로 이동 처리
                @param : url ( string )
                @return : string
               */
              function getUseLocalHost( url ) {
                 var host = location.href;
                 if( host.indexOf(".ellotte.com") !=-1 ) {
                   return url;
                 }  else {  /* 로컬용 */
                   var replaceURL = url.substr(  url.indexOf("?") );
                   return LotteCommon.specMallSubURL + replaceURL;
                 }
               }

            }
        };
    }]);

    /*
      카테고리 슬라이드
    */
    app.directive('elshopCtg', ['$window', '$timeout', '$location', function($window, $timeout, $location) {
        return {
            link:function($scope, el, attrs) {
              function elshopSlide(selectIdx) {
                  var $elshopSubHead = angular.element("#elshopSubHead"), /*헤더 Wrapper*/
                      $elsMenu = $elshopSubHead.find("#elsAmenu"),
                      $menuList = $elsMenu.find(">li"), /*상위 카테고리 리스트*/
                      $sideBar = $elshopSubHead.find(".sideBar > img"), /*더보기 그림자*/
                      $subMenu = $elshopSubHead.find(".ksCB"),
                      winWidth = angular.element($window).width(), /*윈도우 넓이*/
                      menuWidth = $elsMenu.outerWidth(); /*메뉴 넓이*/
                  
                  /*메뉴 사이드에 그림자 표시*/
                  function setMenuSide() {
                      if (menuWidth < winWidth) {
                          $sideBar.removeClass("on");
                      } else if (menuSlide._x() == 0) {
                          $sideBar.filter(".left").removeClass("on");
                          $sideBar.filter(".right").addClass("on");
                      } else if (menuSlide._x() == (winWidth - menuWidth)) {
                          $sideBar.filter(".left").addClass("on");
                          $sideBar.filter(".right").removeClass("on");
                      } else {
                          $sideBar.addClass("on");
                      }
                  }
                  
                  /*대카 클릭시 메뉴 중앙 위치*/
                  function menuClick(index) {
                      /*가운데 위치 찾기*/
                      var $cell = $menuList.eq(index),
                          targetX = winWidth / 2 - parseInt($cell.position().left + ($cell.outerWidth()) / 2),
                          mmax = winWidth - menuWidth;

                      if (targetX > 0 || mmax > 0) {
                          menuSlide.setMoveX(0, 300, setMenuSide);
                      } else if (targetX < mmax) {
                          menuSlide.setMoveX(mmax, 300, setMenuSide);
                      } else {
                          menuSlide.setMoveX(targetX, 300, setMenuSide);
                      }
                  }
                  
                  /*초기화*/
                  function init() {
                      /*메뉴 스와이핑 설정*/
                      menuSlide = $elsMenu.simpleDrag(function() { /*- EGSlider.js 에선언*/
                          menuSlide.setMoveX(menuSlide.getFlickDist2(0, winWidth - menuWidth, 2.5, 40), 300, setMenuSide);
                      });

                      setMenuSide(); /*메뉴 사이드에 그림자 표시 확인*/
                      addEvent(); /*이벤트 바인딩*/
                  }

                  function addEvent() {
                      /*rotate 이벤트 등록  - EGSlider.js 에선언*/
                      rotateWindow(function () {
                          winWidth = $(window).width();
                          menuSlide.setX(0);
                          setMenuSide();
                      });

                      $menuList.on("click", function () {
                          menuClick(angular.element(this).index());
                      });
                  }

                  init(); /*최초 실행*/
              };
              $timeout(elshopSlide); /*생성완료 후 실행*/
            }
        };
    }]);
    
    /*
        20170730
        브랜드배너 스와이프
    */
    app.directive('elshopBrandSwipe',['$timeout',function($timeout){
        return {
            link : function( scope, el, attrs ) {
                var config = {}, copy = false, brndW = 0, resizing = false;

                angular.element(window).bind('resize',function(){
                    var w = angular.element(window).innerWidth();
                    if( w == brndW ) return;
                    resizing = true;
                    align();
                });

                function init(){
                    config = {
                        warp : angular.element(el),
                        container : angular.element(el).find('ul'),
                        total : angular.element(el).find('ul').children().length,
                        siwpex : 0,
                        touchx : 0,
                        v : Number(attrs.v||3),
                        drag : false,
                        sliceW : 0,
                        swipeIndex : 0,
                        side : 0,
                        hold : false
                    }
                    align();
                }
                
                function align() {
                    if( config.total > config.v ) config.drag = true;
                   
                    config.sliceW = parseInt( config.warp[0].clientWidth/config.v );
                    var banners = config.container.children();
                    brndW = config.warp[0].clientWidth;
                    config.swipeIndex = 0;
                    
                    if( config.drag && !copy ) {
                        config.warp.css({width:'100%',overflow:'hidden'});
                        config.container.append( banners.clone(true,true) );
                        config.container.append( banners.clone(true,true) );
                        copy = true;
                    };
                    
                    angular.forEach( config.container.children(), function( e, c ) {
                        var item = angular.element(e);
                        item.css({left:(config.sliceW*c)+"px",width:(config.sliceW)+"px",position:'absolute'});
                    });
                    
                    config.container.css({width:(config.sliceW*(config.total*3))+"px", position:'relative'});
                    if( config.drag  ) {
                        if( !resizing ) dragInit();
                        resizing = false;
                        var cpos = getCurrrentPos();
                        slide( -cpos, true, true, true );
                    }
                }

                function getEasing( easing, noTransition ) {
                    return (easing&&!noTransition) ? {
                        '-webkit-transition': '-webkit-transform ease .3s',
                        '-moz-transition': '-webkit-transform ease .3s',
                        '-o-transition': '-webkit-transform ease .3s',
                        'transition': '-webkit-transform ease .3s'
                    } : {
                        '-webkit-transition': '-webkit-transform linear 0s',
                        '-moz-transition': '-webkit-transform linear 0s',
                        '-o-transition': '-webkit-transform linear 0s',
                        'transition': '-webkit-transform linear 0s'
                    }
                }

                function dragInit (){
                    angular.element(document.body).attr("ondragstart","return false");
                    angular.element(document.body).attr("onselectstart","return false");

                    config.container.bind( 'touchstart touchmove touchend touchleave', function(e){
                        var touchX = e.originalEvent.changedTouches[0].clientX;
                        if( config.hold ) return;
                        switch( e.type ){
                            case "touchstart":
                                config.touchx = touchX;
                                break;
                            case "touchmove":
                                var cpos = config.touchx-touchX;
                                config.side = config.touchx < touchX ? 'prev' : 'next';
                                slide( cpos );
                                break;
                            case "touchend":
                                config.touchx = 0;
                                switch(config.side){
                                    case "prev": prev(); break;
                                    case "next": next(); break;
                                }
                                break;
                        }
                    });
                }

                function slide ( x, e, apply, noTransition ) {
                    var transform = getEasing(e,noTransition), posx = apply?x:(config.siwpex-x);
                    transform['-webkit-transform'] = 'translateX('+posx+'px)';
                    config.container.css(transform);
                    if(e) {
                        config.siwpex = posx;
                    }
                }
                
                function getCurrrentPos(){
                    var c = config.total+config.swipeIndex;
                    return config.sliceW*c;
                }
                
                function next () {
                    if( config.hold || !config.drag ) return;
                    if( config.swipeIndex < (config.total*2)-config.v ) config.swipeIndex++;
                    var cpos = getCurrrentPos();
                    slide( -cpos, true, true );
                    fakePos();
                }

                function prev () {
                    if( config.hold || !config.drag ) return;
                    if( config.swipeIndex > -config.total ) config.swipeIndex--;
                    var cpos = getCurrrentPos();
                    slide( -cpos, true, true );
                    fakePos();
                }

                function fakePos(){
                    var cops, reset;
                    if( config.swipeIndex >= (config.total*2)-config.v ) {
                        config.swipeIndex = config.total-config.v;
                        cops = getCurrrentPos();
                        reset = true;
                    }
                    if( config.swipeIndex <= -config.total ) {
                        config.swipeIndex = 0;
                        cops = getCurrrentPos();
                        reset = true;
                    }
                    config.hold = true;
                    $timeout(function(){
                        if(reset) slide( -cops, true, true, true );
                        config.hold = false;
                    },500);
                }

                scope.control = {
                    next:next,
                    prev:prev
                }

                $timeout(init);
            }
        }
    }]);

})(window, window.angular);
