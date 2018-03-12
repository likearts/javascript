(function(){

	/*
	@ auther : 박해원
	@ date : 20170819
	@ last modify :
	@ ver : 1.0 ( AngularJS v1.3.8 )

	@ EXAMPLE
		## 01 : simple ##
		<div> <- drag container
			<ul hw-one-swipe>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
		</div>

		## 02 : simple ( indicator ) ##
		<div> <- drag container
			<ul
				hw-one-swipe
				swipe-index='swpIndex'
				swipe-page='swpTotal'
				swiepe-control='swpControl'>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
			<div>
				<span
					ng-repeat='btn in swpPage | hwIswpRange'
					ng-class='{active:swpIndex==$index}'
					ng-click='swpControl($index)'>
				</span>
			</div>
		</div>

		## 03 : simple ( prev, next ) ##
		<div> <- drag container
			<ul
				hw-one-swipe
				swiepe-control='swpControl'>
				<li>01</li>
				<li>02</li>
				<li>03</li>
			</ul>
			<div>
				<a ng-click="swpControl('prev')"> prev </a>
				<a ng-click="swpControl('next')"> next </a>
			</div>
		</div>

		@Attributes
			# swipe-index : 현재 번호
			# swipe-page : indicator 총 개수
			# swiepe-control : param( string or number )
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
	var app = angular.module('ngHwSwipe',[]);

	app.controller( 'ngHwSwipeCtrl', [ function(){
		//...
	}]);
		
	app.directive( 'ngHwSwipe', [ function(){
		return {
			scope : { swipeIndex:'=?', swipePage:'=?', swiepeControl : '=?' },
			link : function( scope, el, attrs ) {
				var config = {
					pwrap : angular.element(el).parent(),
					wrap : angular.element(el),
					index : 0,
					page : 0,
					total : 0,
					view : 1,
					slicew : 0,
					touchPos: 0,
					touchPosY: 0,
					pos : 0,
					easing : attrs.easing,
					slide : false,
					space : attrs.sideSpace,
					spacew : attrs.spacePercent || 20,
					autoHeight : attrs.autoHeight == 'true' ? true : false
				}, useScrollPos, duration = 300, minimum = 3, initW = window.innerWidth;

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

				function reset () {

				}

				function copy () {
					for( var i=0; i<=config.total;++i) {
						config.wrap.append( angular.element( config.wrap.children()[i] ).clone( true, true) );
					}
				}

				function count (i,s) {
					var d = s == 'n' ? i+1 : i-1;
					if( d < 0 ) d = config.total-1;
					if( d > config.total-1 ) d = 0;
					return d;
				}

				function align( i, ap ) {
					var n = count(i,'n'), p = count(i), h = config.wrap.children()[0].clientHeight, d = -500;

					if( config.total == 2 && i == 1 ) p = 2;
					if( config.total == 2 && i == 0 ) p = 3;

					config.pwrap.css({width:'100%',overflow:'hidden',height:h,'will-change':'transform','pointer-events':'auto'});
					angular.forEach( config.wrap.children(), function( e, c ) {
						var pos = d;
						if( c == i && pos == d ) pos = 0;
						if( c == n && pos == d ) pos = 100;
						if( c == p && pos == d ) pos = -100;
						angular.element(e).css({
							width:'100%',
							transform:'translate('+pos+'%,0px)'
						});
					});
					config.wrap.css({
						'-webkit-user-drag':'none',
						'touch-action':'pan-y',
						'user-select':'none',
						'will-change':'transform',
						'-webkit-font-smoothing':'antialiased',
						'box-sizing':'border-box',
						height:'100%',
						margin:'0 auto'
					});
					config.index = scope.swipeIndex = i;
					apply(ap);
					autoHeight();
				}

				function autoHeight () {
					if( !config.autoHeight ) return;
					var h = config.wrap.children()[config.index].clientHeight;
					config.pwrap.css({height:h});
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
								draging( config.touchPos-touchX, true );
								config.touchPos = config.touchPosY = 0;
								useScrollPos = null;
								break;
						}

					});
				}

				function apply(ap) {
					try{ if(!ap) scope.$apply() } catch(e) { };
				}

				function resize() {
					if( initW >= config.space ) {
						config.wrap.css({width:(100-config.spacew)+'%'});
					} else {
						config.wrap.css({width:'auto'});
					}
				}

				function initialize () {
					if( config.wrap.children().length < 2 ) return;

					var size = getSize();
					config.total = config.wrap.children().length,
					config.page = scope.swipePage = config.total/config.view;
					config.slicew = size.width/config.view;
					if( config.wrap.children().length < minimum ) copy();
					angular.forEach( config.wrap.children(), function( e, i ) {
						angular.element(e).css({
							width:config.slicew,
							left:0,
							position:'absolute',
							transform : 'translate( '+(100*i)+'%,0px)'
						});
					});

					if(config.autoHeight) {
						config.pwrap.css({
							'-webkit-transition':'height '+duration+'ms '+getCubicBezier( config.easing ),
							'-moz-transition':'height '+duration+'ms '+getCubicBezier( config.easing ),
							'-o-transition':'height '+duration+'ms '+getCubicBezier( config.easing ),
							'-ms-transition':'height '+duration+'ms '+getCubicBezier( config.easing ),
							'transition':'height '+duration+'ms '+getCubicBezier( config.easing )
						})
					}

					angular.element(window).bind('resize', function(){
						if( Math.ceil( initW ) == Math.ceil( window.innerWidth ) || !config.space ) return;
						initW = window.innerWidth;
						resize();
					});
					resize();

					align(0);
					drag();
				}

				scope.goTo = function( i ) {
					align( i );
				}

				scope.swiepeControl = function( str ) {
					if( config.wrap.children().length < 2 ) return;
					switch( str ) {
						case "next": draging( 1, true ); break;
						case "prev": draging( -1, true ); break;
						default:
							if( typeof str != 'number' || str < 0 || str > config.page-1 ) return;
							align( str, true );
					}
				}

				setTimeout(function(){ initialize() }, 300);
			}
		}
	}]);
	
	app.filter('ngHwSwpRange', function(){
		return function(n) {
			var res = [];
			for (var i = 0; i < n; i++) {
				res.push(i);
			}
			return res;
		};
	});
})();
