document.querySelector('#handDraw').innerHTML = `<section class="inner">
			<h1 class="title">Hand Draw</h1>
			<ul class="ui-set">
				<li>
					<label class="form-check-label">
						<input class="form-type-select" type="radio" name="mode" value="1" checked>
						<i class="fa-solid fa-pen"></i>
						ペン
					</label>
				</li>
				<li>
					<label class="form-check-label">
						<input class="form-type-select" type="radio" name="mode" value="2">
						<i class="fa-solid fa-eraser"></i>
						消しゴム
					</label>
				</li>
				<li>
					<i class="fa-solid fa-circle"></i>
					<input id="brush-size-range" type="range" class="form-weight-range" min="1" max="20" value="4"></input>
					<span id="brush-size" class="brush-size-num">4</span>
				</li>
				<li class="right">
					<a id="download" class="button-download" href="" download>
						<i id="downloadMark" class="fa-solid fa-download"></i>
						<span>ダウンロード</span>
					</a>
				</li>
			</ul>
			<article id="canvas-area" width="100%" class="canvas-wrapper">
				<canvas id="imageCanvas" class="image-canvas"></canvas>
				<canvas id="drawCanvas" class="draw-canvas"></canvas>
				<canvas id="tempCanvas" class="draw-temp-canvas"></canvas>
				<canvas id="pointerCanvas" class="ponter-canvas"></canvas>
				<dialog id="clear-modal" class="dialog-clear">
					<p>削除しても良いですか？</p>
					<form id="clear-modal-form" class="dialog-clear__buttons" method="dialog">
						<button id="clearCancel" class="clear-no">キャンセル</button>
						<button id="clearConfirm" class="clear-ok">削除</button>
					</form>
				</dialog>
			</article>
			<ul class="ui-set">
				<li>
					<button id="undo" class="button-undo">
						<i id="undoMark" class="fa-solid fa-arrow-rotate-left"></i>
						<span>戻す</span>
					</button>
				</li>
				<li>
					<button id="redo" class="button-redo">
						<i id="redoMark" class="fa-solid fa-arrow-rotate-right"></i>
						<span>進む</span>
					</button>
				</li>
				<li class="right">
					<button id="clear" class="button-clear">
						<i id="clearMark" class="fa-solid fa-trash"></i>
						<span>削除</span>
					</button>
				</li>
			</ul>
		</section>`;

export const html = () => {}
