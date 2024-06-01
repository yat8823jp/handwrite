const imageCanvas = document.getElementById( "imageCanvas" );
const drawCanvas = document.getElementById( "drawCanvas" );
const drawTempCanvas = document.getElementById( "drawTempCanvas" );
const pointerCanvas = document.getElementById( "pointerCanvas" );

if ( imageCanvas.getContext && drawCanvas.getContext && drawTempCanvas.getContext && pointerCanvas.getContext ) {

	window.addEventListener( 'load', function ( e ) {

		let option = {
			holdClick  : false,
			brushSize  : 4,
			strokeColor: 'rgba(0, 0, 0, 1)',
			startX     : 0,
			startY     : 0
		}

		const ctxs = {
			imageCtx   : imageCanvas.getContext( "2d" ),
			drawCtx    : drawCanvas.getContext( "2d" ),
			drawTempCtx: drawTempCanvas.getContext( "2d" ),
			pointerCtx : pointerCanvas.getContext( "2d" )
		}

		pointerCanvas.addEventListener( 'mousedown', mouseDown( e, ctxs, option ) );
		pointerCanvas.addEventListener( 'mousemove', mouseMove );
		pointerCanvas.addEventListener( 'mouseup', mouseUp( e, ctxs, option ) );

		pointerCanvas.addEventListener( 'mouseout', function ( e ) {
			pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );
			if ( option.holdClick ) mouseUp( e, ctxs, option );
		} );
		zoom();
	} );
	window.addEventListener( "resize", zoom() );
}

function mouseMove( e ) {

}

function mouseUp( e, ctxs, option ) {
	option.holdClick = false;
	drawPen( e, ctxs, option );
}

function mouseDown( e, ctxs, option ) {
    option.holdClick = true;
    option.startX = e.offsetX;
    option.startY = e.offsetY;
}

function drawPen( e, ctxs, option ) {
	ctxs.drawCtx.lineWidth                = option.brushSize;
	ctxs.drawCtx.strokeStyle              = option.strokeColor;
	ctxs.drawCtx.lineJoin                 = "round";
	ctxs.drawCtx.lineCap                  = "round";
	ctxs.drawCtx.beginPath();
	ctxs.drawCtx.moveTo( option.startX, option.startY ); // 開始座標（前回座標）
	ctxs.drawCtx.lineTo( e.offsetX, e.offsetY ); // 終了座標（現在座標）
	ctxs.drawCtx.stroke(); // 直線を描画
	ctxs.drawCtx.closePath();
	option.startX                       = e.offsetX;
	option.startY                       = e.offsetY;
}

function pointer( e, ctxs, option ) {
	ctxs.pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );

	if ( option.holdClick ) {
		drawPen( e, ctxs.drawCtx, option );
	}

	ctxs.pointerCtx.beginPath();
	ctxs.pointerCtx.moveTo( e.offsetX, e.offsetY );
	ctxs.pointerCtx.lineTo( e.offsetX, e.offsetY );
	ctxs.pointerCtx.stroke();
	ctxs.pointerCtx.closePath();
}

function zoom() {
	let displayWidth  = drawCanvas.clientWidth;
	let displayHeight = drawCanvas.clientHeight;

  // canvasの「描画バッファーのサイズ」と「表示サイズ」が異なるかどうか確認する。
	if ( drawCanvas.width != displayWidth || drawCanvas.height != displayHeight ) {

		// サイズが違っていたら、描画バッファーのサイズを
		// 表示サイズと同じサイズに合わせる。
		imageCanvas.width     = displayWidth;
		imageCanvas.height    = displayHeight;
		drawCanvas.width      = displayWidth;
		drawCanvas.height     = displayHeight;
		drawTempCanvas.width  = displayWidth;
		drawTempCanvas.height = displayHeight;
		pointerCanvas.width   = displayWidth;
		pointerCanvas.height  = displayHeight;
	}
}