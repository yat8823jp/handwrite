// モード（描く/消しゴム/画像移動）
var mode = "1";
// 描き込みタイプ（ペン/直線/短径/円）
var inputType = "1";

// 色・透過度
var canvasRgba = "rgba(0, 0, 0, 1)";
// 太さ
var brushSize = 10;
// 透過度
var alpha = 1;

// クリックホールドフラグ
var holdClick = false;

// 開始座標(X)
var startX = 0;
// 開始座標(Y)
var startY = 0;

// 拡大率
var zoomRario = 1;

// 各種canvasオブジェクト
var imageCvs = document.getElementById("imageCanvas");
var imageCtx = imageCvs.getContext("2d");

var drawCvs = document.getElementById("drawCanvas");
var drawCtx = drawCvs.getContext("2d");

var drawTempCvs = document.getElementById("drawTempCanvas");
var drawTempCtx = drawTempCvs.getContext("2d");

var pointerCvs = document.getElementById("pointerCanvas");
var pointerCtx = pointerCvs.getContext("2d");

window.addEventListener("load", function (e) {

    // マウスクリックイベント
    pointerCvs.addEventListener("mousedown", mouseDown);
    // マウス移動イベント
    pointerCvs.addEventListener("mousemove", mouseMove);
    // マウスクリック外しイベント
    pointerCvs.addEventListener("mouseup", mouseUp);
    // マウスホイールイベント
    pointerCvs.addEventListener("wheel", mouseWheel);
    // エリアから外れたときのイベント
    pointerCvs.addEventListener("mouseout", function (e) {
        // ポインター除去
        pointerCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)
        // マウスクリック外しイベントを呼び出し
        if (holdClick) {
            mouseUp(e);
        }
    });
	zoom();
});

window.addEventListener( "resize", zoom() );

// モード変更時
$(function () {
    $('[name="mode"]').on('change', function (e) {
        mode = $('input[name="mode"]:checked').val();

        if (mode == "1") {
            // 描く
            $("#input-type-area").show();
            $("#size-area").show();
            $("#transparent-area").show();
            $("#range-area").show();
            $("#color-picker-area").show();
        } else if (mode == "2") {
            // 消しゴム
            $("#input-type-area").hide();
            $("#size-area").show();
            $("#transparent-area").hide();
            $("#range-area").show();
            $("#color-picker-area").hide();
        } else {
            // 画像移動
            $("#input-type-area").hide();
            $("#size-area").hide();
            $("#transparent-area").hide();
            $("#range-area").hide();
            $("#color-picker-area").hide();
        }
    });
});

// 描き込みタイプ変更時
$(function () {
    $('[name="input-type"]').on('change', function (e) {
        inputType = $('input[name="input-type"]:checked').val();
    });
});

// 色変更時
$(function () {
    $('#colorPicker').on('change', function (e) {

        // colorPicker値設定
        $(this).val(e.detail[0]);

        // canvas用にcanvasRgba形式へ変換
        canvasRgba = "rgba(" +
            parseInt(e.detail[0].substring(1, 3), 16) + ", " +
            parseInt(e.detail[0].substring(3, 5), 16) + ", " +
            parseInt(e.detail[0].substring(5, 7), 16) + ", " +
            alpha + ")";
    });
});

// 「ファイルを選択」ボタン
$(function () {
    $('#uploadFile').on('change', function (e) {

        var file = e.target.files[0];

        if (file.type.indexOf("image") < 0) {
            alert("画像ファイルを指定してください。");
            return false;
        }

        var reader = new FileReader();
        reader.onload = (function (file) {
            return function (e) {
                image(e.target.result);
                $("#explanation").hide();
                zoomRario = 1;
                zoom();
            };
        })(file);
        reader.readAsDataURL(file);
    });
});

// 太さ変更時
function sizeChange(num) {
    document.getElementById("size").innerHTML = num;
    brushSize = num;
}

// 透過度変更時
function alphaChange(num) {
    document.getElementById("transparent").innerHTML = num;
    alpha = num;

    var temp = canvasRgba.replace("rgba(", "").replace(")", "").split(",");
    canvasRgba = "rgba(" +
        temp[0] + ", " +
        temp[1] + ", " +
        temp[2] + ", " +
        num + ")"
}

// マウスクリックイベント
function mouseDown(e) {

    holdClick = true;
    // クリック開始座標を保持
    startX = e.offsetX;
    startY = e.offsetY;
}

// マウス移動イベント
function mouseMove(e) {

    // 座標表示
    document.getElementById("dispX").innerHTML = e.offsetX;
    document.getElementById("dispY").innerHTML = e.offsetY;

    if (mode == "1") { // モード：描く

        if (inputType == "1" || inputType == "2") { // 描き込みタイプ：ペン or 直線
            pointer(e);
        }

        if (holdClick) {
            if (inputType == "1") { // 描き込みタイプ：ペン
                drawPen(e);
            } else if (inputType == "2") { // 描き込みタイプ：直線
                drawLine(e);
            } else if (inputType == "3") { // 描き込みタイプ：短径
                drawRect(e);
            } else if (inputType == "4") { // 描き込みタイプ：円
                drawArc(e);
            }
        }

    } else if (mode == "2") { // モード：消しゴム

        pointer(e);

        if (holdClick) {
            drawErase(e);
        }

    } else { // モード：画像移動

        if (holdClick) {
            imageMove(e);
        }
    }
}

// マウスクリック外しイベント
function mouseUp(e) {

    holdClick = false;

    if (mode == "1") { // モード：描く
        if (inputType == "1") { // 描き込みタイプ：ペン
            drawPen(e);
        } else if (inputType == "2") { // 描き込みタイプ：直線
            drawLine(e);
        } else if (inputType == "3") { // 描き込みタイプ：短径
            drawRect(e);
        } else if (inputType == "4") { // 描き込みタイプ：円
            drawArc(e);
        }
    } else if (mode == "2") { // モード：消しゴム
        drawErase(e);
    }
}

// マウスホイール変更イベント
function mouseWheel(e) {

    // 拡大率算出
    var temp = e.deltaY < 0 ? 1 : -1;
    zoomRario += (0.1 * temp);

    // 拡大率は1～5まで
    if (zoomRario < 1) {
        zoomRario = 1
    } else if (zoomRario > 5) {
        zoomRario = 5
    }

    // 小数点第二以下切り捨て
    zoomRario = Math.round(zoomRario * 10) / 10;

    // 算出した拡大率で描画
    zoom();
    document.getElementById("dispScale").innerHTML = zoomRario;

    // ポインタも再設定
    if ((mode == "1" && (inputType == "1" || inputType == "2"))
        || mode == "2") {
        pointer(e);
    }
}

// drawCanvasエリア描画(ペン)
function drawPen(e) {
    drawCtx.lineWidth = brushSize;
    drawCtx.strokeStyle = canvasRgba;
    drawCtx.lineJoin = "round";
    drawCtx.lineCap = "round";
    drawCtx.globalCompositeOperation = 'source-over';
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY); // 開始座標（前回座標）
    drawCtx.lineTo(e.offsetX, e.offsetY); // 終了座標（現在座標）
    drawCtx.stroke(); // 直線を描画
    drawCtx.closePath();

    // 次の描画に向けて現在の座標を保持（開始・終了を同じ座標で描画すると、マウスを高速に移動したときに歯抜け状態になる）
    startX = e.offsetX;
    startY = e.offsetY;
}

// drawCanvasエリア描画(直線)
function drawLine(e) {

    // 一時的描画Canvasクリア
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)

    if (holdClick) {
        // クリックホールド中は一時的描画Canvasに対して描画
        targateCtx = drawTempCtx;
    } else {
        targateCtx = drawCtx;
    }

    targateCtx.lineWidth = brushSize;
    targateCtx.strokeStyle = canvasRgba;
    targateCtx.lineCap = "round"; // 先端の形状
    targateCtx.globalCompositeOperation = 'source-over';
    targateCtx.beginPath();
    targateCtx.moveTo(startX, startY); // 開始座標（クリック開始座標）
    targateCtx.lineTo(e.offsetX, e.offsetY); // 終了座標（現在座標）
    targateCtx.stroke(); // 直線を描画
    targateCtx.closePath();
}

// drawCanvasエリア描画(短径)
function drawRect(e) {

    // 一時的描画Canvasクリア
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)

    if (holdClick) {
        // クリックホールド中は一時的描画Canvasに対して描画
        targateCtx = drawTempCtx;
    } else {
        targateCtx = drawCtx;
    }

    targateCtx.fillStyle = canvasRgba;
    targateCtx.globalCompositeOperation = 'source-over';

    targateCtx.beginPath();
    // クリック開始座標～現在座標で短径を描画
    targateCtx.fillRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    targateCtx.closePath();
}

// drawCanvasエリア描画(円)
function drawArc(e) {

    // 一時的描画Canvasクリア
    drawTempCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)

    if (holdClick) {
        // クリックホールド中は一時的描画Canvasに対して描画
        targateCtx = drawTempCtx;
    } else {
        targateCtx = drawCtx;
    }

    targateCtx.fillStyle = canvasRgba;
    targateCtx.globalCompositeOperation = 'source-over';

    var centerX = Math.max(startX, e.offsetX) - Math.abs(startX - e.offsetX) / 2;
    var centerY = Math.max(startY, e.offsetY) - Math.abs(startY - e.offsetY) / 2;
    var distance = Math.sqrt(Math.pow(startX - e.offsetX, 2) + Math.pow(startY - e.offsetY, 2));

    targateCtx.beginPath();
    // クリック開始座標～現在座標の中間を中心点として円を描画
    targateCtx.arc(centerX, centerY, distance / 2, 0, Math.PI * 2, true);
    targateCtx.fill();
    targateCtx.closePath();
}

// drawCanvasエリア描画(消しゴム)
function drawErase(e) {

    drawCtx.lineWidth = brushSize;
    drawCtx.lineCap = "round"; // 先端の形状
    drawCtx.strokeStyle = "rgba(255, 255, 255, 1)"; // 色はなんでもよいが、透過度は1にする
    drawCtx.globalCompositeOperation = 'destination-out' // 塗りつぶした個所を透明化
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY); // 開始座標（前回座標）
    drawCtx.lineTo(e.offsetX, e.offsetY); // 終了座標（現在座標）
    drawCtx.stroke(); // 描画
    drawCtx.closePath();

    // 次の描画に向けて現在の座標を保持（開始座標・終了座標を同じ座標にしてしまうと、マウスを高速に移動したときに歯抜け状態になる）
    startX = e.offsetX;
    startY = e.offsetY;
}

// pointerCanvasエリア描画
function pointer(e) {

    // 事前のポインタ描画を除去
    pointerCtx.clearRect(0, 0, imageCvs.width, imageCvs.height)

    if (mode == "2") {
        // モード：消しゴムのときは白固定
        pointerCtx.strokeStyle = "rgba(255, 255, 255, 1)";
    } else {
        pointerCtx.strokeStyle = canvasRgba; // 事前に設定していた色
    }

    pointerCtx.lineWidth = brushSize; // 太さ
    pointerCtx.lineCap = "round"; // 円

    pointerCtx.beginPath();
    pointerCtx.moveTo(e.offsetX, e.offsetY);
    pointerCtx.lineTo(e.offsetX, e.offsetY); // 開始座標と終了座標を同じ
    pointerCtx.stroke(); // 描画
    pointerCtx.closePath();
}

// imageCanvasエリア画像設定
function image(src) {

    var img = new Image();
    img.src = src;
    img.onload = () => {
        // canvasエリアと画像のスケールを計算（縦・横 スケール値が低い方を採用）
        var scale =
            Math.min(
                $('#canvas-area').width() / img.naturalWidth,
                $('#canvas-area').height() / img.naturalHeight);

        // canvasエリアの高さ・幅を設定
        imageCvs.width = img.width * scale;
        imageCvs.height = img.height * scale;

        drawCvs.width = imageCvs.width;
        drawCvs.height = imageCvs.height;

        drawTempCvs.width = imageCvs.width;
        drawTempCvs.height = imageCvs.height;

        pointerCvs.width = imageCvs.width;
        pointerCvs.height = imageCvs.height;

        // 画像を縮小して設定
        imageCtx.drawImage(img, 0, 0, imageCvs.width, imageCvs.height);
    };
}

// 拡大縮小処理
function zoom() {
    // 拡大縮小の起点を設定
    $("#imageCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });

	$("#drawCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });
    $("#drawTempCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });
    $("#pointerCanvas").css({
        "transform-origin":
            document.getElementById("dispX").innerHTML + "px " +
            document.getElementById("dispY").innerHTML + "px"
    });

	// 拡大縮小
    $("#imageCanvas").css({ "transform": "scale(" + zoomRario + ")" });
    $("#drawCanvas").css({ "transform": "scale(" + zoomRario + ")" });
    $("#drawTempCanvas").css({ "transform": "scale(" + zoomRario + ")" });
    $("#pointerCanvas").css({ "transform": "scale(" + zoomRario + ")" });

	let displayWidth  = drawCvs.clientWidth;
	let displayHeight = drawCvs.clientHeight;

  // canvasの「描画バッファーのサイズ」と「表示サイズ」が異なるかどうか確認する。
	if ( drawCvs.width != displayWidth || drawCvs.height != displayHeight ) {

		// サイズが違っていたら、描画バッファーのサイズを
		// 表示サイズと同じサイズに合わせる。
		imageCvs.width     = displayWidth;
		imageCvs.height    = displayHeight;
		drawCvs.width      = displayWidth;
		drawCvs.height     = displayHeight;
		drawTempCvs.width  = displayWidth;
		drawTempCvs.height = displayHeight;
		pointerCvs.width   = displayWidth;
		pointerCvs.height  = displayHeight;
	}
}

// 画像移動処理
function imageMove(e) {

    // 対象領域の長さ
    var targetWidth = $("#imageCanvas").width();
    var targetHeight = $("#imageCanvas").height();

    // 起点位置の取得
    var origin = $("#imageCanvas").css('transform-origin');
    var origins = origin.replaceAll("px", "").split(" ");

    // 起点位置に移動量を加算
    var moveX = Number(origins[0]) + (startX - e.offsetX);
    var moveY = Number(origins[1]) + (startY - e.offsetY);

    // 起点位置を対象範囲内に設定
    if (moveX < 0) {
        moveX = 0;
    } else if (moveX > targetWidth) {
        moveX = targetWidth;
    }
    if (moveY < 0) {
        moveY = 0;
    } else if (moveY > targetHeight) {
        moveY = targetHeight;
    }

    // 起点位置を変更
    $("#imageCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
    $("#drawCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
    $("#drawTempCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
    $("#pointerCanvas").css({ "transform-origin": moveX + "px " + moveY + "px" });
}
