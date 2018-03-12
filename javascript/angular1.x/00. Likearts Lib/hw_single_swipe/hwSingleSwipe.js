(function(){

	/*
	@ auther : 박해원
	@ date : 20170819
	@ last modify :
	@ ver : 1.0 ( AngularJS v1.3.8 )

	@ EXAMPLE
		## 01 : simple ##
		<div> <- drag container
			<ul hw-single-swipe>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
		</div>

		## 02 : simple ( indicator ) ##
		<div> <- drag container
			<ul
				hw-single-swipe
				siwpe-index='swipeIndex'
				siwpe-control='swipeControl'>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
			<div>
				<span
					ng-repeat='btn in swipeData'
					ng-class='{active:swipeIndex==$index}'
					ng-click='swipeControl($index)'>
				</span>
			</div>
		</div>

		## 03 : simple ( prev, next ) ##
		<div> <- drag container
			<ul
				hw-single-swipe
				siwpe-control='swipeControl'>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
			<div>
				<a ng-click="swipeControl('prev')"> prev </a>
				<a ng-click="swipeControl('next')"> next </a>
			</div>
		</div>

		@Attributes
			# swipeIndex: indicator 위치,
			# swiepeControl: ( 'prev' or 'next' )
			# side-space : 양쪽 여백이 표시 조건 ( width )
			# space-percent : 양쪽 여백 값 ( % )
			# auto-height : 높이값 자동 적용
			# easing :
				1. easeOutExpo
				2. easeInOutExpo
				3. easeOutCubic
				4. easeOutQuart
				5. easeOutQuint
				6. easeOutCirc
	*/
	var app = angular.module('hwSingleSwipe',[]);

	app.controller( 'hwSingleSwipeCtrl', [ function(){
		//...
	}]);

	app.directive( 'hwSingleSwipe', [ '$timeout', function($timeout){
		return {
			restrict:'AEC',
			scope : { swipeControl:'=?', swipeData:'=', swipeIndex:'=?' },
			templateUrl : 'tmpl_single_item.html',
			link : function( scope, el, attrs ) {

				var config, useScrollPos, duration = 300, minimum = 3, initW = window.innerWidth;
				function setConfig() {
					config = {
						pwrap : angular.element(el),
						wrap : angular.element(el).find('.siwpe_container'),
						index : 0,
						total : 0,
						touchPos: 0,
						touchPosY: 0,
						pos : 0,
						easing : attrs.easing,
						slide : false,
						space : attrs.sideSpace,
						spacew : attrs.spacePercent || 20,
						autoHeight : attrs.autoHeight == 'true' ? true : false,
						loop : attrs.swipeLoop == 'true' ? true : false
					}
				}

				function getSize () {
					return {
						width : window.innerWidth,
						height : window.innerHeight,
						p : {
							width : config.pwrap.innerWidth(),
							height : config.pwrap.innerHeight()
						},
						w : {
							width : config.wrap.innerWidth(),
							height : config.wrap.innerHeight()
						}
					}
				}

				function count (i,s) {
					var d = s == 'n' ? i+1 : i-1;
					if( d < 0 ) d = scope.swipeData.length-1;
					if( d > scope.swipeData.length-1 ) d = 0;
					return d;
				}

				function align( i ) {
					var n = count(i,'n'), p = count(i), d = -500;

					if( scope.swipeData.length == 2 && i == 1 ) p = 2;
					if( scope.swipeData.length == 2 && i == 0 ) p = 3;

					config.index = scope.swipeIndex = i;
					scope.hwSingleTmplData = [ scope.swipeData[p],scope.swipeData[i],scope.swipeData[n] ];
					scope.$apply();
				}

				function getCubicBezier( type ){
					switch( type ) {
						case "easeOutExpo":
							return "cubic-bezier(0.190, 1.000, 0.220, 1.000)";
						case "easeInOutExpo":
							return "cubic-bezier(1.000, 0.000, 0.000, 1.000)";
						case "easeOutCubic":
							return "cubic-bezier(0.215, 0.610, 0.355, 1.000)";
						case "easeOutQuart":
							return "cubic-bezier(0.165, 0.840, 0.440, 1.000)";
						case "easeOutQuint":
							return "cubic-bezier(0.230, 1.000, 0.320, 1.000)";
						case "easeOutCirc":
							return "cubic-bezier(0.785, 0.135, 0.150, 0.860)";
						default: return "";
					}
				}

				function getEasing( easing ) {
					return easing ? {
						'-webkit-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'-moz-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'-o-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing )
					} : {
						'-webkit-transition': '-webkit-transform 0ms',
						'-moz-transition': '-webkit-transform 0ms',
						'-o-transition': '-webkit-transform 0ms',
						'transition': '-webkit-transform 0ms'
					}
				}

				function translate ( c, p ) {
					c['-webkit-transform'] = p;
					c['-moz-transform'] = p;
					c['-o-transform'] = p;
					c['-ms-transform'] = p;
					c['transform'] = p;
					return c;
				}

				function draging( p, e ) {
					if(config.slide) return;
                    if( p < 1 && (!config.loop && config.index == 0) ||
						p > 1 && (!config.loop && config.index == scope.swipeData.length-1) ) return;

					var np = config.pos - p;
					config.wrap.css( translate( getEasing(e), 'translate('+np+'px,0px)' ) );
					if( e ) {
						config.slide = true;
						var s = p>0?'n':'p';
						config.wrap.css( translate( getEasing(e), 'translate('+(s=='n'?-100:100)+'%,0px)' ) );
						setTimeout(function(){
							var cnt = count( config.index, s );
							config.wrap.css( translate( getEasing(), 'translate(0px,0px)' ) );
							align( cnt );
							config.slide = false;
						}, duration );
					}
				}

				function drag () {
					angular.element(document.body).attr("ondragstart","return false");
					angular.element(document.body).attr("onselectstart","return false");

					config.pwrap.css({display:'block',width:'100%',overflow:'hidden'});
					config.pwrap.bind( 'touchstart touchmove touchend', function(e){

						var touchProps;
						try{ touchProps = e.originalEvent.changedTouches[0]  }
						catch(er) { touchProps = e.changedTouches[0] }
						var touchX = touchProps.clientX, touchY = touchProps.clientY;

						switch( e.type ){
							case "touchstart":
								config.touchPos = touchX;
								config.touchPosY = touchY;
							break;
							case "touchmove":
								var cpos = config.touchPos-touchX, cy = config.touchPosY-touchY;
								if( Math.abs(cy) > 10 && useScrollPos != 'X' ) useScrollPos = 'Y';
								if( Math.abs(cpos) > 20 && useScrollPos != 'Y' ) useScrollPos = 'X';
								if( Math.abs(cpos) > (window.innerWidth) ) return;
								if( useScrollPos != 'Y' ) draging( cpos );
							break;
							case "touchend":
								if(
									Math.abs(Math.abs(config.touchPos) - Math.abs(touchX)) < 30 ) {
									config.wrap.css( translate( getEasing(true), 'translate(0px,0px)' ) );
								} else {
									draging( config.touchPos-touchX, true );
								}
								config.touchPos = config.touchPosY = 0;
								useScrollPos = null;
								break;
						}

					});
				}

				function resize() {
					if( initW >= config.space ) {
						config.pwrap.css({width:(100-config.spacew)+'%'});
					} else {
						config.pwrap.css({width:'auto'});
					}
				}

				function initialize () {
					setConfig();
					if( scope.swipeData.length < 2 ) {
						scope.hwSingleTmplData = scope.swipeData;
						return;
					}
					var size = getSize();

					config.wrap.css({
						'-webkit-user-drag':'none',
						'touch-action':'pan-y',
						'user-select':'none',
						'will-change':'transform',
						'-webkit-font-smoothing':'antialiased',
						'box-sizing':'border-box',
						height:'100%',
						margin:'0 auto',
						'white-space' : 'nowrap'
					});
					angular.element(el).children().css({
						'transform':'translateX(-100%)'
					});

					config.total = scope.swipeData.length,
					scope.hwSingleTmplData = [ scope.swipeData[scope.swipeData.length-1], scope.swipeData[0], scope.swipeData[1] ];
					drag();
				};

				scope.swipeControl = function ( str ) {
					if( scope.swipeData.length < 2 ) return;
					switch( str ) {
						case "next":
							if( !config.loop && config.index == scope.swipeData.length-1 ) return;
							draging( 1, true ); break;
						case "prev":
							if( !config.loop && config.index == 0 ) return;
							draging( -1, true ); break;
						default:
							if( typeof str != 'number' || str < 0 || str > scope.swipeData.length-1 ) return;
							align( str );
					}
				}
				scope.goTo = function( i ) {
					align( i );
				}

				var siwpeDataLoaded = false;
				scope.$watch('swipeData', function(n){
					if(!n) return;
					if(!siwpeDataLoaded) {
						for( var i in scope.$parent ) {
							if( i.indexOf('$') < 0 ) scope[i] = scope.$parent[i];
						}
						initialize();
					}
					else update();
					siwpeDataLoaded = true;
				});

			}
		}
	}]);

	app.filter('hwSingleSwpRange', function(){
		return function(n) {
			var res = [];
			for (var i = 0; i < n; i++) {
				res.push(i);
			}
			return res;
		};
	});

})();
