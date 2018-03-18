(function( window, angular, undefined ) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteSideMylotte',
        'lotteCommFooter',
        'hwSwipe'
    ]);

    app.controller('PetWriteCtrl', ['$scope', 'LotteCommon', 'commInitData', '$http', '$window', function($scope, LotteCommon, commInitData, $http, $window ) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.subTitle = "우리 아이 등록";//서브헤더 타이틀
        $scope.dataForm = {};
        $scope.eformIndex; // 수정 폼 index
        $scope.loadingState = false;
        $scope.isDisplayMode = commInitData.query.dispMode || "edit";
        $scope.formBaseName = "write_form_ID_";

        // 회원 일련번호 ( 등록시 전송 )
        $scope.mbr_no;
        try{ $scope.mbr_no = getLoginInfo().mbrNo } catch(e) {};

        $scope.useDeviceis;
        if( $scope.appObj.isIOS ) { // ios 전용 css
           angular.element('html,body').addClass('device_ios');
           $scope.useDeviceis = "iOS";
        }
        if( $scope.appObj.isAndroid ) { // android 전용 css
            angular.element('html,body').addClass('device_android');
            $scope.useDeviceis = "Android";
        }

        /*
            폼 아이디 생성
            return number
        */
        $scope.randomId = function(){
            return parseInt(Math.random() * 99999999);
        }

        /*
            선택 항목(확인용)
            데이타 로드후 내용은 모두 갱신 됨
        */
        $scope.formOptions = {
            type : [
                { cd_nm :'강아지', cd: 'dog' },
                { cd_nm :'고양이', cd: 'cat' },
                { cd_nm :'소동물', cd: 'etc' }
            ],
            size : {
                dog : [
                    { cd_nm :'소형견', cd: 'small' },
                    { cd_nm :'중형견', cd: 'middle' },
                    { cd_nm :'대형견', cd: 'large' }
                ],
                cat : [
                    { cd_nm :'소형묘', cd: 'small' },
                    { cd_nm :'중형묘', cd: 'middle' },
                    { cd_nm :'대형묘', cd: 'large' }
                ],
                etc : [
                    { cd_nm :'고슴도치', cd: '1' },
                    { cd_nm :'토끼', cd: '2' },
                    { cd_nm :'햄스터', cd: '3' },
                    { cd_nm :'관상어', cd: '4' },
                    { cd_nm :'애완곤충/파충류', cd: '5' }
                ]
            },
            gender : [
                { cd_nm:'남아', cd: 'M' },
                { cd_nm:'여아', cd: 'F' }
            ],
            checkList : {
                dog : [
                    {  cd_nm : '종합영양제', cdcd :'1' },
                    {  cd_nm : '피부/털', cd :'2' },
                    {  cd_nm : '뼈/관절', cd :'3' },
                    {  cd_nm : '눈//귀', cd :'4' },
                    {  cd_nm : '소화기', cd :'5' },
                    {  cd_nm : '신장/요로', cd :'6' },
                    {  cd_nm : '과체중', cd :'7' },
                    {  cd_nm : '저체중', cd :'8' },
                    {  cd_nm : '심장/스트레스', cd :'8' },
                    {  cd_nm : '해충방지', cd :'10' },
                    {  cd_nm : '면연력/식변증', cd :'11' }
                ],
                cat : [
                    {  cd_nm : '헤어볼', cd :'1' },
                    {  cd_nm : '종합영양제', cd :'2' },
                    {  cd_nm : '치아', cd :'3' },
                    {  cd_nm : '피부/털', cd :'4' },
                    {  cd_nm : '신장/요로', cd :'5' },
                    {  cd_nm : '심장/스트레스', cd :'6' },
                    {  cd_nm : '소화기', cd :'7' },
                    {  cd_nm : '과체중', cd :'8' },
                    {  cd_nm : '저체중', cd :'9' },
                    {  cd_nm : '뼈/관절', cd :'10' },
                    {  cd_nm : '눈/귀', cd :'11' },
                    {  cd_nm : '해충방지/기타', cd :'12' }
                ],
                etc : []
            }
        }

        /*
            한자리 숫자 두자리로 반환 "0"추가
            @param : no ( number or string )
            return string
        */
        $scope.addZero = function( no ) {
            return no<10?"0"+no : no;
        }

        /*
            데이타 전송 및 로드
            @param : params ( object {  requestURL:String, method:String, data:object, result:function } )
        */
        $scope.deletePet_list = [];
        $scope.isErrorState = false;
        $scope.Request = function( params ){
            $http({
                 method: params.method,
                 url: params.requestURL,
                 data: JSON.stringify(params.data)
           }).then( function(res){
               console.log( params.requestURL, res );
               if( res.status != 200 ) {
                   console.log( 'http status', res.status );
                   if( !$scope.isErrorState ) { // 여러번 호출 되기 때문에 에러가 나도 알럿은 한번만
                       alert( '"전송실패" 접속이 원활하지 않습니다.' );
                       $scope.isErrorState = true;
                   }
                   if(params.result) params.result( null );
               } else {
                   if(params.result) params.result( res.data );
               }
           }, ( params.error || requestError ) );
       }
       function requestError(e){
           console.log(e);
       }

       /*
            페이지연결
            @param : url ( string )
        */
        $scope.goPage = function( url ) {
            if(!url) return;
            window.location.href = url;
        }
        $scope.addNewForm = function(){
            angular.element( angular.element(".pet_form_foot_buttons").children()[0] ).trigger('click');
        }
        $scope.getCheckList = function(type){
            return $scope.getArray( angular.copy( $scope.formOptions.checkList[type] ) );
        }

        /*
            화면 출력용 길이/3 로 나누기
            @param : type ( string : 종류 코드 )
            return : array
        */
        $scope.getArray=function( data, noNull ){
            noNull = true;
            var list = data,
                n = [], t = list.length/3;
            for( var i=0; i<t; ++i ) {
                var arr = [];
                for( var s=0; s<3;++s) {
                    if( !noNull ) { arr.push( list[i*3+s] );
                    } else { if( list[i*3+s] ){arr.push( list[i*3+s])} }
                }
                n.push(arr);
            }
            return n
        }

        /*
            사진 돌아감 방향계산
            @param : file ( file : input[file] )
            @param : callback ( function )
            return
        */
        $scope.getOrientation = function(file, callback) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var view = new DataView(e.target.result);
                if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                    else if ((marker & 0xFF00) != 0xFF00) break;
                    else offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };
            reader.readAsArrayBuffer(file);
        }
        
        /*
            돌아간 사진에 css처리
            @param : e ( Number: Orientation )
            @param : target ( Element )
            return
        */
        $scope.fakeRotation = function( e, target ){
            switch( String(e) ) {
                // 1 : transform(1, 0, 0, 1, 0, 0);
                //horizontal 2 : ctx.transform(-1, 0, 0, 1, width, 0);
                case "2": target.addClass('horizontal'); break;
                 // rotate180 3 : transform(-1, 0, 0, -1, width, height );
                case "3":  target.addClass('rotate180'); break;
                // rotate90 6 : transform(0, 1, -1, 0, height , 0);
                case "6": target.addClass('rotate90'); break;
                // rotate -90 8: transform(0, -1, 1, 0, 0, width);
                case "8": target.addClass('rotate-90');  break;
                 // vertical 4: transform(1, 0, 0, -1, 0, height );
                case "4": target.addClass('vertical'); break;
                // horizontal + rotate90 5 : transform(0, 1, 1, 0, 0, 0);
                case "5": target.addClass('horizontal_rotate90'); break;
                // horizontal + rotate - 90 7 : transform(0, -1, -1, 0, height , width);
                case "7": target.addClass('horizontal_rotate-90'); break;
            }
        }
        
        /*
            수정시 체크항목(우리아이고민들) 데이타 반환
            @param : type ( string : 펫 종류 )
            @param : data ( array : ex [ code, code, code ] )
            return : array
        */
        function catchCheckList( type, data ){
            if(!data||!data.length) return [];
            var checkData = $scope.formOptions.checkList[type], nArr=[];
            for( var i in checkData ) {
                for( var s=0; s<data.length;++s)  {
                    if( checkData[i].cd == data[s] ) nArr[i] = checkData[i];
                }
            }
            return nArr;
        }
        $scope.getForm = function( formID ){
            return angular.element( $scope.formBaseName+formID );
        }

        /*
            수정시 펫 목록 수정 폼 생성
            @param : res ( object )
        */
        // 10자 이상 잘라내기 ( 이미 잘 못 등록된 데이타 일경우 )
        function getCutName(name){
            return name.length > 10 ? name.substr(0,10) : name;
        }
        function myPetList( res ){
            if( !res || !res.items || !res.items.length ) return;
            var petLength = res.items.length, items = res.items;

            // 바인딩 데이타
            $scope.formList = [];
            $scope.dataForm = {};

            var listID = [], listData = {}, eidx = commInitData.query.bidx;
            for( var i=0; i<petLength; ++i ) {
                var formid = $scope.randomId(),
                    chklist = items[i].worry || [],
                    petbirthday = items[i].birthday.replace(/\./gi,""),
                    yy = petbirthday.substr(0,4),
                    mm = petbirthday.substr(4,2),
                    dd = petbirthday.substr(6,2);

                petbirthday = yy+"-"+mm+"-"+dd; // 출력용
                listID.push( formid );
                listData[formid] = {
                    active: ( items[i].active == 'Y' || (typeof items[i].active == "boolean" && items[i].active ) || ( typeof  items[i].active == "string" && items[i].active == "true" ) ) ? true : false,
                    gender: items[i].gender,
                    name: getCutName(items[i].name),
                    size: items[i].size,
                    type: items[i].type,
                    photo : items[i].img_url || null,
                    birthday : new Date( petbirthday ),
                    checklist : catchCheckList( items[i].type, chklist ),
                    bbc_no:items[i].bbc_no || items[i].bbs_no,
                    worryList: $scope.getCheckList( items[i].type ),
                    cateList: $scope.getArray( angular.copy( $scope.formOptions.size[ items[i].type ] ), true ),
                    rotateCode :items[i].rotate_code
                };
                // 수정 대상 폼 인덱스
                if( eidx && eidx != null && eidx != undefined ) {
                    if( eidx == ( items[i].bbs_no || items[i].bbc_no )  ) {
                        $scope.eformIndex = i;
                    }
                }
            }
            $scope.formList = listID;
            $scope.dataForm = listData;
        }

        function toDataUrl(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                var reader = new FileReader();
                reader.onloadend = function() {
                    callback(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        }

        function getReadFile( url, target ) {
            if(!url) return;
            toDataUrl(url, function(res){
                console.log(res);
            });
            return;
            var request = new XMLHttpRequest();
            request.onload = function() {
                console.log('onload');
                var reader = new FileReader();
                reader.readAsDataURL(request.response);
                reader.onload =  function(e){
                    console.log('DataURL:', e.target.result);
                };
            };
            request.responseType = 'blob';
            request.open( 'GET', url, true );
        }

        $scope.noList;
        function createForms() {
            var formDataURL = LotteCommon.petMallpetFormCodeData;
            if( $scope.isDisplayMode == "edit" ) formDataURL = LotteCommon.petMallpetEditData;
            $scope.Request( {
                requestURL : formDataURL,
                method : "get",
                result : function(res){
                    // 로그인 체크
                    if( !res.dearpet_baby_write.login_id && !$scope.loginInfo.isLogin ) {
                        alert('로그인 후 이용하실 수 있습니다.');
                        var targUrl = "targetUrl="+encodeURIComponent( location.href, 'UTF-8');
                        $window.location.href = LotteCommon.loginUrl+'?'+$scope.baseParam+'&'+targUrl;
                        return;
                    };
                    
                    //console.log( 'success', res );
                    if( $scope.isDisplayMode == "edit" ) {
                        addOptions( res.dearpet_baby_write.cainim_clss_cd.items || [] );
                        if( res.dearpet_baby_write.pet_list ) {
                            if( !res.dearpet_baby_write.pet_list.items ) res.dearpet_baby_write.pet_list = [];
                            if( res.dearpet_baby_write.pet_list.items.length ) {
                                myPetList( res.dearpet_baby_write.pet_list );
                            } else { // 등록 펫이 없으면 신규
                                $scope.formList = [  $scope.randomId() ];
                                $scope.noList = true;
                            }
                        } else {
                            $scope.formList = [  $scope.randomId() ];
                            $scope.noList = true;
                        }
                    } else {
                        addOptions( res.dearpet_baby_write.cainim_clss_cd.items || [] );
                        $scope.formList = [  $scope.randomId() ];
                    }
                }
            });
        }

        function addOptions( data ){
            var codesItems = data || [];
            $scope.formOptions.type = [];
            $scope.formOptions.size = {};
            $scope.formOptions.checkList = [];

            if( !codesItems || !codesItems.length ) return;
            for( var i=0; i<codesItems.length; ++i ) {
                var cd = codesItems[i];
                // 종류
                $scope.formOptions.type.push( { cd_nm:cd.cd_nm, cd:cd.cd} );
                var petSize = cd.canim_sz_cd.items || [];
                if( !petSize.length ) petSize = cd.canim_clss_dtl_cd.items; //소동물
                $scope.formOptions.size[cd.cd] = petSize;
                $scope.formOptions.checkList[cd.cd] = cd.canim_cncn_sct_cd.items || [];
            }
        }

        function init () {
            $scope.Request({
                method : 'get',
                requestURL : LotteCommon.petMallpetFormCodeData,
                result :addOptions
            })
        }
        // 폼 생성
        createForms();
    }]);

    // 등록 폼
    app.directive('dearpetPetWrite', ['$timeout','LotteCommon', '$rootScope', function($timeout,LotteCommon, $rootScope) {
        return {
            templateUrl : '/lotte/resources_dev/mall/pet/dearpet_pet_write_tmpl.html',
            replace : true,
            link : function(scope, el, attrs) {
                var resultStates = [],
                    confirmCnt=0,
                    uploadSizeLimit = 8, // 업로드 가능 용량
                    uploadVer = 292, // 안드로이드 사진업로드 버전
                    tuploadVer = 217, // 안드로이드 사진업로드 버전 ( TStore )
                    loading = function( state ) {
                        if(state!=null || state != undefined ) angular.element("body").scope().loadingState = state;
                        return angular.element("body").scope().loadingState;
                };

                /* hwSwipe pulbic */
                scope.swipereset;
                scope.swipeCtrl;
                scope.setMoiveFnc;
                // scope.swpIdx;

                /*
                    이름 10자까지만 입력제한
                    @param : e ( event )
                    return
                */
                function specialCharRemove(obj) {
                    var val = obj.value;
                    var pattern = /[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9)]/gi;
                    if(pattern.test(val)){
                        obj.value = val.replace(pattern,"");
                    }
                }
                scope.updateTotal = function( e ){
                    var text = angular.element(e.currentTarget).val(),
                        pattern = /[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9)]/gi;
                        length = text.length;
                    if(pattern.test(text)){
                        angular.element(e.currentTarget).val( text.replace(pattern,"") );
                    }
                    if( e.tpye == "keydown" && text.length >=10 ) {
                        e.preventDefault();
                    } else {
                        if( e.type == "keyup" && text.length > 10 ) {
                            angular.element(e.currentTarget).val( text.substr(0,9) );
                        }
                    }
                }

                /*
                    종류변경시 마다 기본값 적용
                    @param : c ( string )
                    @param : type ( string )
                    return
                */
                scope.dateArrow = true;
                scope.typeis = function( c, type ){
                    if( scope.dataForm[c].type == type ) return;
                    // 대상 폼 element
                    var thisForm = scope.getForm( c );
                    scope.dataForm[c].size = null;
                    scope.dataForm[c].gender = null;
                    scope.dataForm[c].checklist = [];
                    scope.dataForm[c].worryList = scope.getCheckList(type);
                    scope.dataForm[c].cateList = scope.getArray( angular.copy( scope.formOptions.size[type] ), true );
                    // 변경시 마다 초기 선택값 고정
                    scope.defaultSetting(c, type);
                }

                /*
                    기본값 적용
                    @param : c ( string )
                    @paam : type ( string )
                    return
                */
                scope.defaultSetting = function(c, type){
                    if( !scope.dataForm[c].type ) return;
                    scope.dataForm[c].size = scope.formOptions.size[ type ][0].cd;
                    scope.dataForm[c].gender = "M";
                }

                /*
                    수정시 고민목록 자동체크
                    @param : item ( object )
                    @param : c ( string )
                    @param : i  ( int )
                    return
                */
                scope.setWorry = function( item, c, i ) {
                    try{
                        if(!scope.dataForm[c].checklist) scope.dataForm[c].checklist =[];
                    } catch(e) { scope.dataForm[c].checklist=[] }
                    if(!scope.dataForm[c].checklist[i]) {
                        scope.dataForm[c].checklist[i] = item;
                    } else { scope.dataForm[c].checklist[i] = null }
                }

                // 사진 업로드는 안드로이드 버젼 체크
                scope.AccessUpload = true;
                scope.userVersionCheck = function(){
                    if (confirm('롯데닷컴 앱 업데이트 후 이용 가능합니다. 지금 업데이트 하시겠습니까?')) {
                        var appDownURL = "market://details?id=com.lotte";
                        if( scope.appObj.isSktApp ) appDownURL = "https://www.onestore.co.kr/userpoc/apps/view?pid=0000677011";
                        location.href = appDownURL;
                    }
                }

                /*
                    사진 선택시 미리보기 만들기
                    @param : target ( element : input[type=file] )
                    return null
                */
                scope.photoPreview = function( target ) {
                    if(!scope.AccessUpload) return;
                    var file = target.files[0],
                        i = angular.element(target).attr('gi'),
                        reader  = new FileReader(),
                        max = uploadSizeLimit*1000*1000,// 서버에서 체크하는 방식과 맞춤
                        imgcontainer = angular.element(target).parent().find('figure');

                    imgcontainer.children().remove();
                    scope.dataForm[i].photo = null;
                    scope.dataForm[i].rotateCode = null;

                    try{ scope.$apply() }catch(e){};
                    if(!file||  file==undefined) return;

                    imgcontainer.attr('class','');
                    if(!checkExt(file.type)) {
                        alert('jpg/png 파일만 업로드 가능합니다.');
                        return;
                    }

                    if( file.size > max ) {
                        alert( '우리 아이 사진 용량이 '+uploadSizeLimit+'MB 초과하였습니다.' );
                        return;
                    }
                    loading(true);
                    loadImage( file, function (img) {
                            try{ scope.dataForm[i].photo = img.toDataURL() }
                            catch(e) { imgcontainer.append( img ) }
                            loading(false);
                            try{ scope.$apply() } catch(e) { };
                        }, { maxWidth:800, minWidth:216, minHeight:216, cover:true, canvas: true } // Options
                    );

                    /* 사진 돌아감 예외 처리 */
                    scope.getOrientation(file, function(c) {
                        //scope.fakeRotation( e, imgcontainer );
                        scope.dataForm[i].rotateCode = c;
                        try{ scope.$apply() } catch(e) { };
                    });
                }

                /*
                    폼 추가 ( 등록 폼 영역 추가 )
                */
                scope.formADD = function(){
                    // 연속클릭 방지
                    if( loading() ) return;
                    loading(true);
                    // 2초후 활성화
                    $timeout(function(){
                        loading(false);
                        try{ scope.$apply() } catch(e){}
                    }, 1500 );

                    if( scope.swpIdx == 0 && angular.element(".pet_write_forms .form").children().length == 2 ) {
                        var contentis = false, dataSet = scope.dataForm[ scope.formList[scope.formList.length-1] ];
                        for( var i in dataSet ) {
                            if(i&&i!=undefined&&dataSet[i]) contentis = true;
                        }
                        if(!contentis){
                            scope.swipeCtrl("next");
                            return;
                        }
                    }
                    scope.formList.push( scope.randomId() );
                    defaultSetting();
                    $timeout(function() {
                        try{
                            scope.swipereset(true);
                            scope.swipeCtrl("end");
                            scope.$apply(); }
                        catch(e){};
                    }, 300 );
                }

                /*
                    등록된 아이삭제
                    @param : bbc_no ( number )
                    @param : reload ( boolean )
                    returm
                */
                scope.deleteResults = [];
                function sendDelete ( bbc_no, reload ) {
                    //console.log( '삭제', bbc_no );
                    var reqURL = LotteCommon.petMallpetDeleteData+"?bbc_no="+bbc_no;
                    console.log('삭제', bbc_no, reqURL);
                    scope.Request({
                        method : 'GET',
                        requestURL : reqURL,
                        result: function(res) {
                            console.log( '삭제 결과', res );
                            scope.deleteResults.push( res );
                            if( resultStates.length == confirmCnt && scope.deleteResults.length == scope.deletePet_list.length ) {
                                printState( confirmCnt, !resultStates.length ? "삭제되었습니다." : null );
                                confirmCnt = 0;
                            }
                        }
                    });
                }

                /*
                    등록폼 삭제
                    @param : formIndex ( string )
                    return
                */
                scope.formDelete = function( formIndex, cIndx ){
                    // 삭제 데이타
                    var deleteData = scope.dataForm[formIndex];
                    // 연속클릭 방지
                    if( loading() ) return;
                    // 로딩 표시
                    loading(true);
                    // 1초후 활성화
                    $timeout(function(){
                        loading(false);
                        try{ scope.$apply() } catch(e){}
                    }, 1000 );
                    // 삭제 데이타 담기
                    if( deleteData && deleteData != null && ( deleteData.bbs_no || deleteData.bbc_no ) )  {
                        scope.deletePet_list.push( deleteData.bbs_no || deleteData.bbc_no );
                    }
                    // 한개 인경우 내용만 초기화
                    if( scope.formList.length < 2 ) {
                        console.log( '2개이하' );
                        if( !confirm('작성중인 내용도 모두 삭제 됩니다. 삭제 하시겠습니다?') ) return;
                        // 1개 일경우 바로 삭제
                        if( scope.deletePet_list.length ) {
                            for( var i=0; i<scope.deletePet_list.length; ++i ) {
                                sendDelete( scope.deletePet_list[i], true );
                            }
                        }
                        var type = scope.formOptions.type[0].cd;
                        scope.dataForm[ scope.formList[0] ] = { active:true, type:type };
                        angular.element(".pet_write_forms .form input[type=file]").val('');
                        scope.defaultSetting( scope.formList[0], type );
                        return;
                    }

                    // 폼 삭제
                    if( confirm('작성중인 내용도 모두 삭제 됩니다. 삭제 하시겠습니다?') ) {
                        var type = scope.formOptions.type[0].cd, delActive = scope.dataForm[formIndex].active;
                        // 데이타 삭제
                        delete scope.dataForm[formIndex];
                        for( var i=0; i<scope.formList.length;++i) {
                            if( formIndex == scope.formList[i] ) scope.formList.splice( i, 1 );
                        }
                        // 삭제 아이가 대표 아이 일경우 첫번째 데이타를 대표로 변경
                        if( delActive ) scope.dataForm[ scope.formList[0] ].active = true;

                        $timeout(function() {
                            try{
                                scope.swipereset(true);
                                var mid = cIndx == scope.formList.length ? cIndx -1 : cIndx;
                                if( mid < 0 )  mid = 0;
                                scope.setMoiveFnc( mid  );
                                scope.$apply();
                            } catch(e){};
                        }, 300 );
                    }
                }
                scope.getSizeList = function(type){
                    return scope.getArray( angular.copy( scope.formOptions.size[type] ) );
                }
                scope.dateFocus = function( e ) {
                    //console.log(e);
                }

                /*
                    대표 아이 변경
                    @param : c ( number )
                    return : object
                */
                scope.activeChange = function( c ){
                    var isCurrentActive ;
                    for( var i in scope.formList ) {
                        if( c != scope.formList[i] && scope.dataForm[ scope.formList[i] ].active ) {
                            isCurrentActive = scope.dataForm[ scope.formList[i] ];
                        }
                    }
                    if( isCurrentActive && c != null ) {
                        if( confirm( '이미 설정한 대표 아이가 있습니다.\n변경하시겠습니까?' ) ) {
                            isCurrentActive.active = false;
                        } else {
                            $timeout(function(){
                                scope.dataForm[c].active = false;
                                scope.$apply();
                            }, 300 );
                        }
                    }
                    return isCurrentActive;
                }

                /*
                    초기실행
                    @param
                    return
                */
                function init(){
                    defaultSetting();
                    // 등록 모드시에만
                    if( scope.isDisplayMode != "edit" && !scope.activeChange() ) scope.dataForm[ scope.formList[0] ].active = true;
                    if( scope.isDisplayMode == "edit" && scope.noList ) scope.dataForm[ scope.formList[0] ].active = true;
                    // 수정 대상 폼으로 이동.
                    if( scope.eformIndex != null && scope.eformIndex != undefined ) scope.setMoiveFnc( scope.eformIndex );
                    // 앱이고 안드로이드일경우 업로드 가능 버젼인지 확인
                    //alert( "[앱테스트 결함 아님] : " + JSON.stringify(scope.appObj) );
                    if( scope.appObj.isApp && scope.appObj.isAndroid ) {
                        if( ( !scope.appObj.isSktApp && scope.appObj.verNumber < uploadVer ) || ( scope.appObj.isSktApp && scope.appObj.verNumber < tuploadVer ) ) {
                                scope.AccessUpload = false;
                        };
                    }
                }

                function defaultSetting(){
                    for( var i =0; i<scope.formList.length; ++i ) {
                        if(!scope.dataForm[ scope.formList[i] ]) {
                            scope.dataForm[ scope.formList[i] ] = { };
                            // 기본 선택 값
                            scope.dataForm[ scope.formList[i] ].type = scope.formOptions.type[0].cd;
                            scope.dataForm[ scope.formList[i] ].size = scope.formOptions.size[ scope.dataForm[ scope.formList[i] ].type ][0].cd;
                            scope.dataForm[ scope.formList[i] ].gender = "M";
                            scope.dataForm[ scope.formList[i] ].worryList = scope.getCheckList( scope.dataForm[ scope.formList[i] ].type );
                            scope.dataForm[ scope.formList[i] ].cateList = scope.getArray( angular.copy( scope.formOptions.size[  scope.dataForm[ scope.formList[i] ].type] ), true );
                        }
                    }
                }

                /*
                    폼 데이타 리셋
                    @param
                    return
                */
                function reset(){
                    scope.dataForm = {};
                    scope.formList = [  scope.randomId() ];

                    loading(false);
                    defaultSetting();

                    $timeout(function() {
                        try{
                            scope.swipereset(true);
                            scope.$apply(); }
                        catch(e){};
                    }, 300 );
                }

                function checkExt( fileType ){
                    if( fileType == "image/jpeg" || fileType == "image/png" ) return true;
                    return false;
                }

                /*
                    화면 출력용 길이/3 로 나누기
                    @param : type ( string : 종류 코드 )
                    return : array
                */
                function getArray( data, nullIs ){
                    var list = data,
                        n = [], t = list.length/3;
                    for( var i=0; i<t; ++i ) {
                        var arr = [];
                        for( var s=0; s<3;++s) {
                            if( !nullIs ) { arr.push( list[i*3+s] );
                            } else { if(list[i*3+s]!=null) arr.push( list[i*3+s] )  }
                        }
                        n.push(arr);
                    }
                    return n;
                }

                /*
                    폼 인덱스 반환
                    @param : code ( string )
                    return number
                */
                function getIndex( code ){
                    for( var i=0; i<scope.formList.length; ++i ) {
                        if( code == scope.formList[i] ) return i;
                    }
                    return null;
                }

                /*
                    데이타 가공 및 등록 ( base64 업로드용 )
                    @param : params ( object )
                    @param : finishNo (  number )
                    @param : returnIs ( boolean )
                */
                function save( params, finishNo, returnIs ){

                    var copyData = angular.copy(params),
                        cdate = new Date( copyData.birthday ),
                        yy = cdate.getFullYear(),
                        mm = scope.addZero(cdate.getMonth()+1),
                        dd = scope.addZero(cdate.getDate()),
                        baseURL = LotteCommon.petMallpetWriteData; // ( 기본 등록 )

                    copyData.birthday = yy+mm+dd;
                    copyData.bbs_no = copyData.bbs_no || copyData.bbc_no;
                    copyData.bbc_no = copyData.bbs_no || copyData.bbc_no;

                    // 게시물 코드가 있으면 수정 모드
                    if( copyData.bbs_no || copyData.bbc_no )  baseURL = LotteCommon.petMallpetReWrite;

                    // 전달 데이타 가공
                    if( copyData.photo ) {
                        copyData.file = copyData.photo;
                        delete copyData.photo;
                    }

                    if( !copyData.active || copyData.size == undefined ) copyData.active = false;
                    if( copyData.type == '30' ) {
                        copyData.cate = copyData.size;
                        delete copyData.size;
                     }

                     if( copyData.checklist && copyData.checklist.length ) {
                         var worry = [];
                         for( var i=0; i<copyData.checklist.length; ++i ) {
                             if( copyData.checklist[i] ) worry.push( copyData.checklist[i].cd );
                         }
                         copyData.worry = worry;
                         delete copyData.checklist;
                     }
                     if( returnIs ) return copyData;

                     scope.Request( {
                        method: 'get',
                        requestURL : baseURL,
                        data : copyData,
                        result : function( res ) {
                            var res_code = res.result_code;
                            resultStates.push( res );
                            if( resultStates.length == finishNo ) {
                                printState( finishNo );
                                confirmCnt = 0;
                            }
                        },
                        error : function( res ) {
                            console.log( 'error', res );
                        }
                     });
                }

                /*
                    폼전송 이벤트 등록, 삭제
                    @param : type (string)
                    return
                */
                function addFormSubmitEvent( type ) {
                    if( type == "bind" ) {
                        angular.element(".pet_write_forms form").bind('submit', function(e) {
                            var formData = new FormData( $(this)[0] ),
                                ngData = scope.dataForm[ angular.element(this).attr('dataID') ],
                                submitURL = ( ngData.bbc_no || ngData.bbs_no ) ? LotteCommon.petMallpetReWrite : LotteCommon.petMallpetWriteData;
                                //submitURL = "http://127.0.0.1"; // ( likearts 로컬환경에서 업로드 테스트 )
                                // FromData 전송을 위한 $http( 에러 ) -> $.ajax( 정상 ) 사용
                                console.log( submitURL );

                            $.ajax({
                                url : submitURL,
                                type : "post",
                                data : formData,
                                async : false,
                                ache : false,
                                contentType : false,
                                processData : false,
                                success: function( res ){
                                    console.log( 'success', res, res.indexOf('reg_success') != -1 ? 'reg_success' : 'reg_error' );
                                    resultStates.push( res.indexOf('reg_success') != -1 ? 'reg_success' : 'reg_error'  );
                                    console.log( resultStates );
                                    if( resultStates.length == confirmCnt && scope.deleteResults.length == scope.deletePet_list.length ) {
                                        printState( confirmCnt );
                                        confirmCnt = 0;
                                    }
                                },
                                error : function( e ) {
                                    console.log( e );
                                }
                            });
                            e.preventDefault();
                        });
                    }
                     // submit 이벤트 삭제
                    else {
                        angular.element(".pet_write_forms form").unbind('submit');
                    }
                }

                /*
                    전송완료후 실패 여부 체크
                    @param : max ( number )
                    return
                */
                function printState ( max, cusMsg ) {
                    var msg = max > 1 ? '등록이 모두 완료 되었습니다.' : '등록되었습니다.',
                        loss = 0,
                        error_msg;
                    // 등록 실패 체크
                    for( var i=0; i<resultStates.length; ++i ) {
                        if( resultStates[i] != "reg_success" ) loss++;
                    }

                    // scope.requestState = false;
                    if( !loss ) { // 정상등록
                        alert( cusMsg || msg );
                    } else { // 미 등록시
                        if( loss === resultStates.length ) {
                            alert( error_msg || '등록실패' );
                            // 로딩 숨김
                            loading(false);
                            return;
                        } else {
                            alert( loss+"개의 데이타가 등록 실패하였습니다." );
                        }
                    }
                    resultStates = [];
                    // 메인으로
                    window.location.href = LotteCommon.petMallMainUrl+"?"+scope.baseParam;
                }

                /*
                    전송 전 항목 체크
                    @param
                    return
                */
                scope.requestState = false;
                scope.submit = function(){
                    // 전송중에 클릭 방지
                    if( scope.requestState ) return;
                    scope.requestState = true;
                    // 등록 결과 배열 초기화
                    resultStates = [];
                    // 삭제 결과 배열 초기화
                    scope.deleteResults = [];
                    // 필터링 배열
                    var perfect = [], trouble = [];
                    // 에러 알럿 초기화
                    scope.isErrorState = false;
                    // 입력 데이타가 전혀 없는 폼 체크
                    for( var i=0; i<scope.formList.length; ++i ) {
                        var form = scope.dataForm[ scope.formList[i] ],
                            checkfield = { name:false,type:false,size:false,birthday:false,gender:false }, // 필수 체크 항목
                            checkCnt = 0;
                        for( var s in form ) {
                            var currentKey = form[s];
                            for( var d in checkfield ) {
                                if( s == d && currentKey && currentKey != undefined ) {
                                    checkfield[d] = true;
                                    checkCnt++;
                                }
                            }
                        }
                        // 부적합 ( 아예 입력안한 폼은 제외 )
                        if( checkCnt > 0 && checkCnt < 5 ) {
                            trouble.push( scope.formList[i] );
                        }
                        // 적합
                        if( checkfield.name && checkfield.type && checkfield.size && checkfield.birthday && checkfield.gender ) {
                            perfect.push( [ form, scope.formList[i] ] );
                        }
                    }

                    // 입력이 완료 되지 않은 폼이 있을경우
                    if( trouble.length ) {
                        alert( '필수값(*)이 모두 입력되지 않았습니다.');
                        var slideTrobleform = getIndex(trouble[0]);
                        if( slideTrobleform!=null && scope.setMoiveFnc ) scope.setMoiveFnc( slideTrobleform );
                        scope.requestState = false;
                        return;
                    }

                    if( perfect.length ) {
                    	loading(true);
                        addFormSubmitEvent("bind"); // ajax base64  -> 폼전송 방식으로 변경으로 추가
                        confirmCnt = perfect.length;
                        
                        // 삭제용
                        if( scope.deletePet_list.length ) {
                            for( var i=0; i<scope.deletePet_list.length; ++i ) {
                                sendDelete( scope.deletePet_list[i] );
                            }
                        }
                        
                        $timeout(function(){
                        	
	                        // 등록 수정용
	                        for( var i=0; i<perfect.length; ++i ) {
	                            // save( perfect[i], perfect.length ); // base64 upload ( 개발에서 폼전송 방식으로 변경 요청으로 미 사용 : 20170706 )
	                            // 폼 전송 방식 적용 인풋 데이타 가공
	                            var currentData = perfect[i],
	                                targetForm = angular.element( "#"+scope.formBaseName+perfect[i][1] ),
	                                submitURL = LotteCommon.petMallpetWriteData,
	                                datatoString = angular.element( "#"+scope.formBaseName+perfect[i][1]+" input[type=date]").val();
	                            // 전송용 :: 2017-00-00 or 2017.00.00 -> 201700000
	                            angular.element( "#"+scope.formBaseName+perfect[i][1]+" input[name=birthday]" ).val( datatoString.replace(/[^(0-9)]/gi,"") );
	                            angular.element( "#"+scope.formBaseName+perfect[i][1]+" input[name=active]" ).val( currentData[0].active ? true : false );
	                            console.log(currentData);
	                            // 전송
	                            targetForm.submit();
	                        }
	                        $timeout(function(){
	                            addFormSubmitEvent("remove"); // 4초 후 이후 폼 전송 이벤트 삭제
	                        },1000);
	                        
                        }, 300 );
                    } else {
                        alert( '아이 정보를 입력해주세요.' );
                    }
                }
                // 초기실행
                $timeout(init);
            }
        }
    }]);

    // 로딩
    app.directive( 'touhchBlockingLoading', [ function($timeout) {
        return { template : '<div ng-if="loadingState" class="overlay_loading"><div class="loading"></div></div>' }
    }]);
    app.directive('lotteContainer', ['$timeout','LotteCommon', function($timeout,LotteCommon) {
        return { templateUrl : '/lotte/resources_dev/mall/pet/dearpet_pet_write_container.html' };
    }]);

    /* header each */
    app.directive('subHeaderEach', [ '$window', function($window) {
        return {
            replace : true,
            link : function($scope, el, attrs) {
                /*이전 페이지 링크*/
                var elHeight = el[0].offsetHeight;
                var $body = angular.element('body');
                $scope.gotoPrepage = function() {
                    $scope.sendTclick("m_header_new_pre");
                    history.go(-1);
                };
                angular.element($window).on('scroll', function(evt) {
                    if (this.pageYOffset > 0 ){
                        angular.element('body').css("paddingTop",elHeight+"px");
                        el[0].style.cssText = 'z-index:800;position:fixed;top:'+$scope.headerHeight+'px;width:100%;';
                    }else{
                        angular.element('body').css("paddingTop","0px");
                        el[0].style.cssText = '';
                    }
                });
            }
        }
    }]);

})(window, window.angular);
