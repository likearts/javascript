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
        'lotteProduct'
    ]);
    
    app.controller('ElshopSpecMallSubCtrl', ['$http', '$rootScope', '$scope', 'LotteStorage', 'LotteCommon', 'commInitData', 'LotteUtil', '$location','$window','$timeout', function($http, $rootScope, $scope, LotteStorage, LotteCommon, commInitData, LotteUtil, $location,$window, $timeout) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.productMoreScroll = true;
        $scope.screenID = "main_SpeDisp";
        $scope.tClickBase = "m_EL_";
        $scope.templateType = "image";
        $scope.pageLoading = true; // 페이지 첫 로딩
        $scope.LotteSuperBlockStatus = true;
        $scope.tclickCode; // 전문관 disp_no
        $scope.specMallDispNo; // 매장 코드
        
        $scope.elShop = {
            curDispNo : commInitData.query.curDispNo,
            upCurDispNo : commInitData.query.beforeNo,
            cateDepth: commInitData.query.cateDepth,
            stgCheck:false,
            bestItem:null,
            goodsList:null
        };
        
        $timeout(function () {
            console.log($scope.changeSlidePos);
        }, 1000);
        
        $scope.pageOptions = {
          initPageParam:false,
          sort: [
  			{sortText:'신상품순',sortcode:10},
            {sortText:'인기상품순',sortcode:11},
            {sortText:'낮은가격순',sortcode:12},
            {sortText:'높은가격순',sortcode:13}
		 ],
         sortIndex:0, // 인기상품
         sortPopup:false,
         useScroll : 0
       };

        $scope.screenData = {
            page: 0,
  			pageSize: 20,
  			pageEnd: false,
  			goodsTotal: 0,
  			goodsList: [],
            resetData : function(){
                $scope.screenData.page = 0;
                $scope.screenData.pageSize = 20;
                $scope.screenData.pageEnd = false;
                $scope.screenData.goodsTotal = 0;
                $scope.screenData.goodsList = [];
                $timeout(function () {
                  $scope.$apply();
                  $scope.getProductData();
                }, 300);
            }
        };

        // 로컬 테스트
        if( window.location.href.indexOf(".ellotte.com") > -1 ) {
          $scope.elShop.stgCheck = true;
        } else {
          $scope.elShop.stgCheck = false;
        };
        
        // 로컬이 아니면 로그 출력 않하도록
        if($scope.elShop.stgCheck)  {
          console.log = function(){};
        }

        $scope.sortPopupState = function(){
          $scope.pageOptions.sortPopup = !$scope.pageOptions.sortPopup;
        }

        // 헤더 클릭시 전문관 메인으로 이동
        $scope.subheaderlinkURL;
        $scope.form= {sortCode: $scope.pageOptions.sort[ $scope.pageOptions.sortIndex ].sortcode }
        $scope.sortSelect = function( index ) {
          if( $scope.pageOptions.sortIndex == index ) return;
          $scope.pageOptions.sortIndex = index;
          $scope.pageOptions.sortPopup = false;
          $scope.pageOptions.useScroll = 432;
          $scope.form.sortCode = $scope.pageOptions.sort[ $scope.pageOptions.sortIndex ].sortcode;
          $scope.screenData.resetData();
        }

        /*
            상품 url
            @param : params( object )
            @return : string
        */
        $scope.getProductURL= function(params) {
            var url = LotteCommon.specMallSubData + "?" + $scope.baseParam  +"&upCurDispNo=" + $scope.elShop.upCurDispNo + "&curDispNo=" + commInitData.query.curDispNo;
            if( $scope.screenData.page ) {
              url += "&page=" + $scope.screenData.page + "&sort=" + $scope.pageOptions.sort[ $scope.pageOptions.sortIndex ].sortcode;
            }
            return url;
        };

        /*
            상품 데이타 로드
            @param : params ( object )
            @return
        */
        $scope.getProductData = function(params){
          if($scope.screenData.pageEnd) return;
          $scope.screenData.page++;
          if($scope.screenData.page > 1) {
              $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Scl_Prd_page'+$scope.screenData.page);
              $scope.productListLoading = true;
          } else {
              $scope.pageLoading = true;
          }
          $scope.$parent.LotteSuperBlockStatus = true;

          try {
    			$http.get($scope.getProductURL(params))
    			.success(function(data) {
                    //console.log( params, data );
					if($scope.screenData.page <= 1 && !$scope.pageOptions.initPageParam) {
						$scope.pageOptions.initPageParam = true;
					}

                  $scope.specMallDispNo = data.elshopSub.disp_lrg_no;

                  // 카테고리
                  if(!$scope.catData) {
                    $scope.ctgData = data;
                    $scope.elShop.bestItem = data.elshopSub.bestGoodListitems;
                    $scope.catData = $scope.nCatArr.setCatData( data.elshopSub.cate_list.items );
                    $scope.dataLoadInit();
                    $scope.lineMapInit();
                    colorTheme();
                  }

                  // 티클릭 페이지 코드
                  if(!$scope.tclickCode) {
                    $scope.tclickCode = $scope.curDispNo = data.elshopSub.disp_lrg_no;
                    // 전문몰 링크
                    $scope.subheaderlinkURL =LotteCommon.specMallMainURL + "?dispNo=" + $scope.tclickCode + "&" + $scope.baseParam;
                  }
                  $scope.screenData.goodsTotal = data.elshopSub.categoryGoodsCount;
                  $scope.pageLoading = false;

                  if($scope.screenData.page > 1) {
                      var newDataArray = $scope.screenData.goodsList.concat( data.elshopSub.categoryGoodsListItems.items );
                      $scope.screenData.goodsList = newDataArray;
                  } else {
                      $scope.screenData.goodsList = data.elshopSub.categoryGoodsListItems.items;
                  }

                  if($scope.screenData.goodsTotal < $scope.screenData.page*$scope.screenData.pageSize) {
                      $scope.screenData.pageEnd = true;
                      $scope.productMoreScroll = false;
                  }
                  $scope.productListLoading = false;
                  $scope.$parent.LotteSuperBlockStatus = false;
                  $scope.pageLoading = false;
              })
              .error(function() {
                  $scope.productListLoading = false;
                  $scope.$parent.LotteSuperBlockStatus = false;
                  $scope.pageLoading = false;
              });
          } catch(e) {}
      }

      /*
        백그라운드 컬러 ( color code or background-img url )
        @param : color ( string )
        @param : object ( object )
        @return : object
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
            컬러적용
            @param
            @return
        */
        function colorTheme(){
            var colorTheme = $scope.ctgData.elshopSub.elshopMenuTheme || {},
                head = angular.element('#head_sub h2');

            // 헤더 컬러 적용
            if( colorTheme.menuBackgroundImgUrl ) {
                $scope.menuBackgroundImgUrl = colorSourceFilter( colorTheme.menuBackgroundImgUrl );
                //console.log($scope.menuBackgroundImgUrl);
                //head.css( colorSourceFilter( colorTheme.menuBackgroundImgUrl ) );
            }

            try{ $scope.headerBackBackgroundColor = $scope.ctgData.elshopSub.subTitleImgBanner.conts_desc_cont; }
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
            //  헤더 뒤로가기 버튼 블랙 차리 ( 기본 화이트 )
            if( colorTheme.menuBackButtonColor ) {
                $scope.menuBackButtonColor = colorTheme.menuBackButtonColor;
                if( $scope.menuBackButtonColor == "white" ) angular.element('body').addClass('overlay');
            } else {
                angular.element('body').addClass('overlay');
            }
        }

        $scope.getProductData();

        /**
    		 * unload시 관련 데이터를 sessionStorage에 저장
    		 */
    		angular.element($window).on("unload", function(e) {
    			var sess = {};
    			sess.templateType = $scope.templateType;
    			sess.pageOptions = $scope.pageOptions;
    			sess.screenData = $scope.screenData;
    			if (!commInitData.query.localtest && $scope.leavePageStroage) {
    				LotteStorage.setSessionStorage($scope.screenID+'Loc', $location.absUrl());
    				LotteStorage.setSessionStorage($scope.screenID+'Data', sess, 'json');
    				LotteStorage.setSessionStorage($scope.screenID+'ScrollY', angular.element($window).scrollTop());
    			}
    		})
    }]);

    app.directive('elshopSubContainer', ['$window', '$timeout', '$location', 'LotteCommon', function($window, $timeout, $location, LotteCommon) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/elshop_spec_mall_sub_container.html',
            replace:true,
            link: function (scope,  el, attrs)
            {
                /*
                    헤더에 전문관 로고 출력
                    @param :
                    @return :
                */
                function initHead(){
                  try{
                    var headData = scope.ctgData.elshopSub.subTitleImgBanner;
                    if( headData.img_url ) {
                      scope.subTitle = "<img src='"+headData.img_url+"' alt='"+headData.alt_cont+"'/>";
                    } else {
                      scope.subTitle = headData.banner_nm;
                    }
                  } catch(e){};
                  if(scope.ctgData.elshopSub.subTitleImgBanner.conts_desc_cont) {
                      $timeout( function(){
                        angular.element("#elshopSubHead").css({background:scope.ctgData.elshopSub.subTitleImgBanner.conts_desc_cont});
                      }, 300 );
                  }
                }

                /*
                    데이터 로드가 완료되면 컨트롤러에서 콜
                    @param :
                    @return
                */
                scope.dataLoadInit = function() {
                    initHead();
                    // BEST ITEM.
                    scope.alias.bestItem.data = scope.ctgData.elshopSub.bestGoodsListItems.items;
                }

                /*
                    베스트 아이템
                    @param :
                    @return :
                */
                scope.bestNext = function(){
                  scope.alias.bestItem.swipeControl.moveIndex( scope.alias.bestItem.swipeControl.getIndex()+1);
                }
                scope.bestPrev = function(){
                  scope.alias.bestItem.swipeControl.moveIndex( scope.alias.bestItem.swipeControl.getIndex()-1);
                }
                scope.bestItemLink = function(item, cnt) {
                  var prdIndex = scope.zero(cnt+1),
                      tClickCode = "m_EL_SpeDisp"+scope.tclickCode+"_Sub_best_" + scope.zero( scope.catedepthsNo[0]+1) + "_" + scope.zero( scope.catedepthsNo[1]+1) + "_Clk_Prd_" + prdIndex,
                      baseURL = LotteCommon.prdviewUrl + "?" + scope.baseParam + "&goods_no=" + item.goods_no+ "&tclick=" + tClickCode + "&curDispNo=" + scope.tclickCode;;
                      window.location.href=baseURL;
                }

                /*
                    데이터 별 object
                    @param :
                    @return :
                */
                var dataObjectList = ["bestItem"], alias = {};
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

    app.directive('lineMap', ['commInitData','LotteCommon','$timeout', function(commInitData, LotteCommon, $timeout){
      return {
        link : function( scope, el, attrs ) {
          scope.lineMapData = [];
          scope.curCnt = -1;
          scope.catedepthsNo = [];
          scope.dispNos = [];
          scope.lineMapOpendata;

         /*
            라인맵 현재위치 데이터 반환
            @param : code ( number : disp_no )
            @param : vcode ( number : disp_no, 중복 제거용 )
            @return
        */
          function getCurrentData( code, vcode ) {
              var curData, data = scope.ctgData.elshopSub.cate_list.items || [];
              angular.forEach( data, function( v, k, i ){
                  if(curData) return;
                  if( !curData && v.disp_no == code && code != vcode )  { curData = [ v, k ]  }
                    angular.forEach( v.sub_cate_list, function( v, k, i ){
                      if( !curData && v.disp_no == code && code != vcode ) { curData = [ v, k ]  }
                      angular.forEach( v.sub_cate_list, function( v, k, i ){
                        if( !curData && v.disp_no == code ) { curData = [ v, k ]  }
                      });
                    });
              });
              return curData;
          };

          /*
            상위노드 반환
            @param : dispNo ( number )
            @return : object
        */
          function getParentNode( dispNo ) {
              if(!dispNo ) return {};
              var data = scope.ctgData.elshopSub.cate_list.items || [];
              for( var i=0; i<data.length; ++i  ) {
                  var adata = data[i], asub = adata.sub_cate_list || [];
                  for( var s=0;s<asub.length;++s) {
                      if( dispNo == asub[s].disp_no ) return adata;
                  }
              }
              return null;
          }

          /*
            라인맵 초기화
            @param :
            @return :
        */
          scope.lineMapInit = function(){
        	  
              var lineMapData  = [], useCat = [ ], bigCateIndex;
              switch( String(scope.elShop.cateDepth) ) {
              	case "2" : useCat.push( scope.elShop.curDispNo ); break;
              	case "3" : useCat = [ scope.elShop.upCurDispNo, scope.elShop.curDispNo ]; break;
              	case "4" : useCat = [ getParentNode( scope.elShop.upCurDispNo ).disp_no, scope.elShop.upCurDispNo, scope.elShop.curDispNo ];
              }
              
              scope.elshopCate.useCat = useCat;
              for( var i in useCat ) {
                if( useCat[i] ) {
                  var curDepthNo = getCurrentData( useCat[i], ( i>0 ? useCat[i-1] : null)  );
                  console.log( 'curDepthNo', curDepthNo );
                  scope.catedepthsNo.push( curDepthNo[1] );
                  lineMapData.push( curDepthNo[0] );
                  scope.dispNos.push( useCat[i] );
                  if( i==0 && !bigCateIndex ) bigCateIndex = curDepthNo[1];
                }
              }
              

              // 3depth 이하면 3depth까지 만들기
              var nr = angular.copy(lineMapData), cDispNo;
              if( nr.length < 3  ) {
                  for( var i=nr.length; i<3; ++i ) {
                    try{
                      if(  lineMapData[lineMapData.length-1].sub_cate_list ) {
                        var inNo = 0;
                        var curDepthNo = getCurrentData( lineMapData[lineMapData.length-1].sub_cate_list[inNo].disp_no, lineMapData[lineMapData.length-1].disp_no );
                        cDispNo = curDepthNo[0].disp_no;
                        scope.catedepthsNo.push( curDepthNo[1] );
                        lineMapData.push( curDepthNo[0] );
                        scope.dispNos.push( cDispNo );
                      }
                    } catch(e) {}
                  }
              }
              
              scope.lineMapData = lineMapData;
              try { scope.lastDispNo = lineMapData[lineMapData.length-1].disp_no; }
              catch(e) { console.log('비정상적인 경로로 접근') };
              
              try{ // 20170804 소카에 전체 추가
                 var subAllCat = scope.lineMapData[0].sub_cate_list || [];
                 if( subAllCat.length&&scope.lineMapData.length == 2 ) {
                     var all = angular.copy( scope.lineMapData[0] );
                     all.disp_nm = "전체";
                     // 중카코드가 curDispNo(param)과 같을경우
                     if( scope.elShop.curDispNo == scope.dispNos[0] ) scope.dispNos[1] = all.disp_no;
                     subAllCat.unshift(all);
                 }
              } catch(e) {}

              if( scope.lineMapData.length == 2 && scope.elShop.cateDepth == 2 ) {
                  scope.lineMapData[1].linemap_nm = "전체";
              };

              // 라인맵 2줄 않되게 ( cutlength : 1, 2, 3 depth 합친 최대 글자 수 )
              var limitis = [], cutlength = 19;
              for( var i in scope.lineMapData ) limitis.push( (scope.lineMapData[i].linemap_nm || scope.lineMapData[i].disp_nm).length );
              if( limitis[0] + limitis[1] + limitis[2] >= cutlength ) {
                var lastText = (scope.lineMapData[i].linemap_nm||scope.lineMapData[2].disp_nm), over = (limitis[0] + limitis[1] + limitis[2] ) - cutlength;
                scope.lineMapData[2].cut_nm = lastText.substr(0, lastText.length-over) + "..";
              }
              
              /* 자동 선택 */
              $timeout(function(){
            	  // if(bigCateIndex) angular.element("#elshopSubHead").scope().changePos(bigCateIndex);
            	  // scope.subCatOpenState( scope.lineMapData.length-1 );
              },500);
        }
          
          /*
            서브카테고리 스와이프용 데이타
            @param : data ( array )
            @return
            */
          function subCateSiwpeData( data ){
              data.sub_cate_list_n = [];
              var arr_list = subGroupArray( data.sub_cate_list, 10 ) || [];
              if( arr_list.length ) data.sub_cate_list_n = arr_list;
          }

          /*
            배열 그룹화
            @param : arr ( array )
            @param : limit ( int )
            @return : array
            */
          function subGroupArray( arr, limit ) {
              if( !arr ) return [];
              var s_arr = [], max = arr.length/limit;
              for( var s=0; s<max; ++s  ) {
                  var n_arr = [];
                  for( var j=0; j<limit;++j ) {
                      var item = arr[s*limit+j];
                      if( item ) n_arr.push( item );
                  }
                  if(n_arr.length) s_arr.push( n_arr );
              }
              return s_arr;
          }
          
          /*
            서브카테고리 열고 닫기
            @param : i ( int )
            @return :
            */
          scope.subCatOpenState = function( i ){
            scope.curCnt = scope.curCnt == i ? -1 : i;
            scope.lineMapOpendata = scope.getUseData(scope.curCnt);
            console.log( '#sel', scope.lineMapOpendata, scope.dispNos );
          }
          scope.openSwipePosX = function(index){
              var swipeScope = angular.element(".mask.sub_open_cat_list_wap").scope();
              swipeScope.goSlide(index);
          }
          
          /*
            카테고리 뎁스별 서브 카테고리 출력 데이터 만들기
            @param : i ( int )
            @param : dispno ( number )
            @return : array
            */
          scope.getUseData = function(i, dispno ){
            var n = null, o = scope.ctgData.elshopSub.cate_list.items;
            switch( String( i ) ) {
              case "0" :  n = {sub_cate_list_n: subGroupArray( o, 10 )};  break;
              case "1":
                n = { sub_cate_list_n: subGroupArray( o[ scope.catedepthsNo[0] ].sub_cate_list, 10 ) };
                break;
              case "2":
                n = { sub_cate_list_n: subGroupArray( o[ scope.catedepthsNo[0] ].sub_cate_list[ scope.catedepthsNo[1] ].sub_cate_list, 10 ) };
                break;
            }
            return n;
          }
        }
      }
    }]);

    /*
      전문몰 타이틀, 카테고리
    */
    app.directive('newSpecMallCtg', ['LotteCommon','commInitData', function(LotteCommon,commInitData) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/category/new_spec_mall_ctg_container.html',
            replace:true,
            link:function( $scope, el, attrs, $timeout )
            {
                $scope.elshopCate = {
                    useCatinfo:{},
                    topBanner:{},
                    showAllCategory:false
                };
                $scope.headerHeight = "45"; /* 헤더 픽스 사이즈 */

                /*
                    중카, 소카  그룹화 n/2
                    @param :
                    @return :
                */
                $scope.nCatArr = {
                    getSubList : function(arr) {
                        var n = [],
                            max = Math.ceil( arr.length/2 ),
                            v = 2;
                        for(var i=0;i<max;++i){
                            var sliceArr=[];
                            for(var s=0;s<v;++s) {
                                var c = i*v+s;
                                if( arr[c] ) {
                                    arr[c].depthIndex = c; // sequnce
                                    arr[c].groupIndex = i; // 1/2 group sequnce
                                    arr[c].subIndex = s;
                                    sliceArr.push( arr[c] );
                                }
                            }
                            if(sliceArr.length) { n.push({s:sliceArr}); }
                        }
                        return n;
                    },
                    setCatData : function( data ) {
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
                    중카 클릭시 하위 열기
                    @param :  catIs ( object )
                    @param : depth ( int )
                    @return :
                    */
                $scope.openCatList = function( catIs, depth ) {
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
                            try{ catItem["depth"+String( Number(key.substr( key.length-1 ))+1 )] = null }
                            catch(e){}
                        }
                    }
                    // 2depth 열림
                    if( catItem.depth1 != null && catItem.depth2 != null ) {
                      $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1)+"_"+$scope.zero(catItem.depth2));
                    }
                    $scope.elshopCate.useCatinfo = catItem || {};
                }
                $scope.closeCatList = function() {
                    $scope.elshopCate.useCatinfo = {};
                }
                $scope.showAllCategoryClick = function(){
                  $scope.elshopCate.useCatinfo = {};
                  $scope.elshopCate.showAllCategory = !$scope.elshopCate.showAllCategory;
                  if($scope.elshopCate.showAllCategory) {
                    $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_header_cate");
                  }
                }
                $scope.subCtgClick = function( i ){
                    $scope.showAllCategoryClick();
                    setTimeout( function() { angular.element("#elshopSubHead li:eq("+i+")").triggerHandler("click");  }, 100 );
                }

                /* 페이지연결 */
               $scope.randingURL = function( url, tclick, customParams ) {
                 if(!url) { console.log('링크없음'); return; }
                 url = getUseLocalHost(url);
                  var params = "";
                  if( url.indexOf("?") != -1 ) {
                    params = "&tclick="+(tclick||"")+"&"+ getBaseParams();
                  } else {
                    params = "?tclick="+(tclick||"")+"&"+ getBaseParams();
                  }
                  if( customParams ) {
                    for( var i in customParams ) {
                      if( customParams[i] ) params += "&"+i+"="+customParams[i];
                    }
                  }
                  location.href = url + params;
               }

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
                        //menuSlide = null, /*슬라이드 Plug-in*/
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
                        //console.log("----- 1");
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
                    $scope.changePos = menuClick;
                    console.log( '$scope.changePos', $scope.changePos );
                    console.log( $elshopSubHead.scope() );

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

})(window, window.angular);
