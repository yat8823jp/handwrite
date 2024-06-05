const imageCanvas    = document.getElementById( "imageCanvas" );
const drawCanvas     = document.getElementById( "drawCanvas" );
const drawTempCanvas = document.getElementById( "drawTempCanvas" );
const pointerCanvas  = document.getElementById( "pointerCanvas" );

let timer = 0;
let mode  = 1; //1:pen 2:eraser
let offsetX, offsetY;
let imageData;
const undoMax   = 10;
const undoData  = [];
const redoData  = [];
const undoMark  = document.getElementById( 'undoMark' );
const redoMark  = document.getElementById( 'redoMark' );
const clearMark = document.getElementById( 'clearMark' );

const brachSizeRange = document.getElementById( 'brush-size-range' );
const clearButton = document.getElementById( 'clear' );
const clearModal  = document.getElementById( 'clear-modal' );
const clearCancelButton = document.getElementById( 'clearCancel' );
const clearConfirmButton = document.getElementById( 'clearConfirm' );
const clearModalForm  = document.getElementById( 'clear-modal-form' );
const undoButton  = document.getElementById( 'undo' );
const redoButton  = document.getElementById( 'redo' );
clearButton.disabled = true;
undoButton.disabled = true;
redoButton.disabled = true;

const ctxs = {
	imageCtx   : imageCanvas.getContext( "2d" ),
	drawCtx    : drawCanvas.getContext( "2d", { willReadFrequently: true } ),
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

let brushSizeChange = ( num ) => {
	document.getElementById( 'brush-size' ).innerHTML = num;
	option.brushSize = num;
}

let zoom = () => {
	let displayWidth  = drawCanvas.clientWidth;
	let displayHeight = drawCanvas.clientHeight;
  	// Check to Buffer size and display size for responsive.
	if ( drawCanvas.width != displayWidth || drawCanvas.height != displayHeight ) {
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

if ( imageCanvas.getContext && drawCanvas.getContext && drawTempCanvas.getContext && pointerCanvas.getContext ) {

	window.addEventListener( 'load', function ( e ) {
		pointerCanvas.addEventListener( 'mousedown',  mouseDown );
		pointerCanvas.addEventListener( 'touchstart', mouseDown );
		pointerCanvas.addEventListener( 'mousemove',  mouseMove );
		pointerCanvas.addEventListener( 'touchmove',  mouseMove );
		pointerCanvas.addEventListener( 'mouseup',    mouseUp );
		pointerCanvas.addEventListener( 'touchend',   ( e ) => { e.preventDefault(); mouseUp } );

		pointerCanvas.addEventListener( 'mouseout', ( e ) => {
			ctxs.pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );
			if ( option.holdClick ) mouseUp( e );
		} );
		zoom();
	} );
	window.addEventListener( 'resize', zoom() );
	window.addEventListener( 'change', () => {
		mode = Number( document.querySelector( 'input[name="mode"]:checked' ).value );
	} );
	brachSizeRange.addEventListener( 'change', ( e ) =>  {
		brushSizeChange( e.target.value );
	} );
	undoButton.addEventListener(  'click', () => undo() );
	redoButton.addEventListener(  'click', () => redo() );
	clearButton.addEventListener( 'click', () => clear() );
}


let mouseDown = ( e ) => {
	let offsets = getOffsets( e );
	option.holdClick = true;
	option.startX = offsets.x;
	option.startY = offsets.y;
	redoReset();
	undoStack();
}

let getOffsets = ( e ) => {
	const rect = e.target.getBoundingClientRect();
	let offsets = {
		x: 0,
		y: 0
	};
	if ( e.touches ) {
		offsets.x = Math.floor( e.touches[0].clientX - rect.left );
		offsets.y = Math.floor( e.touches[0].clientY - rect.top );
	} else {
		offsets.x = e.offsetX;
		offsets.y = e.offsetY;
	}
	return offsets;
}

let mouseMove = ( e ) => {
	pointer( e );
	e.preventDefault();
	if ( mode === 1 ) {
		if ( option.holdClick ) {
			drawPen( e );
		}
	} else if ( mode === 2 ) {
		pointer( e );
		if ( option.holdClick ) {
			drawErase( e );
		}
	}
}

let mouseUp = ( e ) => {
	option.holdClick = false;
	if ( mode === 1 ) {
		drawPen( e );
	} else if ( mode === 2 ) {
		drawErase( e );
	}
}

let drawPen = ( e ) => {
	let offsets = getOffsets( e );
	ctxs.drawCtx.lineWidth   = option.brushSize;
	ctxs.drawCtx.strokeStyle = option.strokeColor;
	ctxs.drawCtx.lineJoin    = "round";
	ctxs.drawCtx.lineCap     = "round";
	ctxs.drawCtx.globalCompositeOperation = 'source-over';
	ctxs.drawCtx.beginPath();
	ctxs.drawCtx.moveTo( option.startX, option.startY );
	ctxs.drawCtx.lineTo( offsets.x, offsets.y );
	ctxs.drawCtx.stroke();
	ctxs.drawCtx.closePath();
	option.startX = offsets.x;
	option.startY = offsets.y;
	clearButtonToggle();
}

let drawErase = ( e ) => {
	let offsets = getOffsets( e );
	ctxs.drawCtx.lineWidth   = option.brushSize;
	ctxs.drawCtx.strokeStyle = 'rgba( 255, 255, 255, 1 )';
	ctxs.drawCtx.globalCompositeOperation = 'destination-out';
	ctxs.drawCtx.beginPath();
	ctxs.drawCtx.moveTo( option.startX, option.startY );
	ctxs.drawCtx.lineTo( offsets.x, offsets.y );
	ctxs.drawCtx.stroke();
	ctxs.drawCtx.closePath();
	option.startX = offsets.x;
	option.startY = offsets.y;
}

let pointer = ( e ) => {
	let offsets = getOffsets( e );
	ctxs.pointerCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );
	if ( mode === 2 ) {
		ctxs.pointerCtx.strokeStyle = "rgba(255, 255, 255, 1)";
	} else {
		ctxs.pointerCtx.strokeStyle = option.strokeColor;
	}
	ctxs.pointerCtx.lineWidth = option.brushSize;
	ctxs.pointerCtx.lineJoin = "round";

	ctxs.pointerCtx.beginPath();
	ctxs.pointerCtx.moveTo( offsets.x, offsets.y );
	ctxs.pointerCtx.lineTo( offsets.x, offsets.y );
	ctxs.pointerCtx.stroke();
	ctxs.pointerCtx.closePath();
}

let undoStack = () => {
	imageData = ctxs.drawCtx.getImageData( 0, 0, drawCanvas.width, drawCanvas.height );
	if ( undoData.length >= undoMax ) undoData.shift();
	undoData.push( imageData );
	undoButton.disabled = false;
	undoMark.style.color = '#333';
}

let redoStack = () => {
	imageData = ctxs.drawCtx.getImageData( 0, 0, drawCanvas.width, drawCanvas.height );
	if ( redoData.length >= undoMax ) redoData.shift();
	redoData.push( imageData );
	redoButton.disabled = false;
	redoMark.style.color = '#333';
}

let undo = () => {
	if ( undoData.length > 0 ) {
		redoStack();
		ctxs.drawCtx.putImageData( undoData.pop(), 0, 0 );
		if( ! undoData.length ) {
			undoButton.disabled = true;
			undoMark.style.color = null;
		}
	}
	clearButtonToggle();
}

let redo = () => {
	if ( redoData.length > 0 ) {
		undoStack();
		ctxs.drawCtx.putImageData( redoData.pop(), 0, 0 );
		if( ! redoData.length ) {
			redoButton.disabled = true;
			redoMark.style.color = null;
		}
	}
	clearButtonToggle();
}

let redoReset = () => {
	redoData.length = 0;
	redoMark.style.color = null;
}

let clearButtonToggle = () => {
	imageData = ctxs.drawCtx.getImageData( 0, 0, drawCanvas.width, drawCanvas.height );
	data = imageData.data;
	dataReduce = data.reduce( function ( prev, current, i, arr ) { return prev + current } );
	if( dataReduce ) {
		clearButton.disabled = false;
		clearMark.style.color = "#333";
	} else {
		clearButton.disabled = true;
		clearMark.style.color = null;
	}
}

let clear = () => {
	clearModal.showModal();
	clearConfirmButton.addEventListener( 'click', clearConfirm );
}

let clearConfirm = () => {
	undoStack();
	ctxs.imageCtx.clearRect( 0, 0, imageCanvas.width, imageCanvas.height );
	ctxs.drawCtx.clearRect( 0, 0, drawCanvas.width, drawCanvas.height );
	ctxs.pointerCtx.clearRect( 0, 0, drawCanvas.width, drawCanvas.height );
	clearMark.style.color = null;
	clearButton.disabled = true;
	clearModal.close();
}
