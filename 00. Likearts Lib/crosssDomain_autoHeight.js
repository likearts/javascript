
(fnction(){

	// IFRAME AUTO HEIGHT :: 20170808 박해원 ( iframe )
	var frmPage, frmWindow, frmReload = false, frameWidth;
	function iframeAutoHeight(){
		if($scope.dispNoParam!='5408554') return;
		$timeout( iframeInit, 1000 );
	}
	function iframeInit(){
		frmPage = angular.element(".plan_bannerWrap iframe")[0];
		frmWindow = frmPage.contentWindow;
		
		angular.element(frmPage).attr('onLoad', 'angular.element(this).scope().iframeOnLoaded()');
		frmPage.height = "auto";
		window.onmessage = onmessage;
		sendMessage();
		window.onload = sendMessage;
		window.onresize = iframeResize;
		
		frameWidth = window.innerWidth;
	}
	function iframeResize (){
		if( Math.ceil( frameWidth ) == Math.ceil( window.innerWidth ) ) return;
		frameWidth = window.innerWidth;
		var url = angular.element(frmPage).attr('src');
		angular.element(frmPage).attr('src', url );
	}
	function sendMessage(){
		frmWindow.postMessage('lotte.com','*');
	}
	function onmessage(e){
		if( frmReload ) return;
		frmReload = true;
		sendMessage();
		if (e.data.type==="dearpet") {
			frmPage.height  = event.data.height+"px";
 			}
	}
	$scope.iframeOnLoaded = function(){
		frmReload = false;
		frmPage.height = "0px";
		angular.element($window).scrollTop(0);
		sendMessage();
	}
	// END IFRAME AUTO HEIGHT 
	
})();