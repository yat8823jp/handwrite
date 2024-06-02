const imageCanvas = document.getElementById( "imageCanvas" );
const drawCanvas = document.getElementById( "drawCanvas" );
const drawTempCanvas = document.getElementById( "drawTempCanvas" );
const pointerCanvas = document.getElementById( "pointerCanvas" );

const ctxs = {
	imageCtx   : imageCanvas.getContext( "2d" ),
	drawCtx    : drawCanvas.getContext( "2d" ),
	drawTempCtx: drawTempCanvas.getContext( "2d" ),
	pointerCtx : pointerCanvas.getContext( "2d" )
}

let option = {
	holdClick  : false,
	brushSize  : 4,
	strokeColor: 'rgba(0, 0, 0, 1)',
	startX     : 0,
	startY     : 0
}

if ( imageCanvas.getContext && drawCanvas.getContext && drawTempCanvas.getContext && pointerCanvas.getContext ) {

	window.addEventListener( 'load', function ( e ) {

		pointerCanvas.addEventListener( 'mousedown', mouseDown );
		pointerCanvas.addEventListener( 'mousemove', mouseMove );
		pointerCanvas.addEventListener( 'mouseup',   mouseUp );

		pointerCanvas.addEventListener( 'mouseout', function ( e ) {
			ctxs.pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );
			if ( option.holdClick ) mouseUp( e );
		} );
		zoom();
	} );
	window.addEventListener( "resize", zoom() );
}

function mouseDown( e ) {

    option.holdClick = true;
    option.startX = e.offsetX;
    option.startY = e.offsetY;
}

function mouseMove( e ) {
	pointer( e );
	if ( option.holdClick ) {
		drawPen( e );
	}
}

function mouseUp( e ) {
	option.holdClick = false;
	drawPen( e );
}

function drawPen( e ) {
	ctxs.drawCtx.lineWidth                = option.brushSize;
	ctxs.drawCtx.strokeStyle              = option.strokeColor;
	ctxs.drawCtx.lineJoin                 = "round";
	ctxs.drawCtx.lineCap                  = "round";
	ctxs.drawCtx.beginPath();
	ctxs.drawCtx.moveTo( option.startX, option.startY );
	ctxs.drawCtx.lineTo( e.offsetX, e.offsetY );
	ctxs.drawCtx.stroke();
	ctxs.drawCtx.closePath();
	option.startX                         = e.offsetX;
	option.startY                         = e.offsetY;
}

function pointer( e ) {
	ctxs.pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );

	if ( option.holdClick ) {
		drawPen( e );
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