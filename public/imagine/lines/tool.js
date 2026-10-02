import { lines } from "./lines.js";
import { sample } from "./samples.js";

export function mount(host){
	host.innerHTML = `<div class="lines-inputs">
		<label>Sample <select aria-label="Sample"><option value="box">Box · 8 corners, 12 edges</option><option value="seam">Faint seam + noise</option><option value="room">Room</option><option value="photo">Photo · paving + gull</option></select></label>
		<label class="lines-upload">Choose or drop image <input type="file" accept="image/*" aria-label="Choose image"></label>
		<button type="button" class="lines-save">Save PNG</button>
	</div><div class="lines-controls"></div>
	<div class="lines-images"><figure><figcaption>Original</figcaption><canvas class="lines-original" aria-label="Original image"></canvas></figure><figure><figcaption>Line art</figcaption><canvas class="lines-result" aria-label="Line-confidence image"></canvas></figure></div>
	<p class="lines-status muted" role="status" aria-live="polite"></p>`;
	const original = host.querySelector('.lines-original'), output = host.querySelector('.lines-result');
	const status = host.querySelector('.lines-status'), select = host.querySelector('select');
	const controls = host.querySelector('.lines-controls');
	const opts = { window: 5, length: 17, noise: 0.006, gamma: 0.8 };
	const params = new URL(location.href).searchParams;
	if ([...select.options].some(o => o.value === params.get('sample'))) select.value = params.get('sample');
	function remember(){
		const url = new URL(location.href);
		url.searchParams.set('sample', select.value);
		for (const [key, value] of Object.entries(opts)) url.searchParams.set(key, value);
		history.replaceState(history.state, '', url);
	}
	let source, scores, timer, generation = 0;
	for (const [key, title, min, max, step] of [
		['window', 'Window size', 3, 21, 2], ['length', 'Line length', 3, 61, 2],
		['noise', 'Noise floor', 0.001, 0.05, 0.001], ['gamma', 'Gamma', 0.2, 2, 0.05],
	]){
		const label = document.createElement('label');
		label.innerHTML = `<span>${title} <output>${opts[key]}</output></span><input type="range" aria-label="${title}" min="${min}" max="${max}" step="${step}" value="${opts[key]}">`;
		const input = label.querySelector('input'), value = label.querySelector('output');
		if (params.has(key) && Number.isFinite(Number(params.get(key)))) input.value = params.get(key);
		opts[key] = Number(input.value); value.value = input.value;
		input.addEventListener('input', () => {
			opts[key] = Number(input.value); value.value = input.value; remember();
			if (key === 'gamma') paint(); else schedule();
		});
		controls.append(label);
	}
	function paint(){
		if (!scores) return;
		const image = output.getContext('2d').createImageData(source.width, source.height);
		for (let i = 0; i < scores.length; i++){
			const v = Math.round(255 * (1 - Math.pow(scores[i], opts.gamma)));
			image.data.set([v, v, v, 255], i * 4);
		}
		output.getContext('2d').putImageData(image, 0, 0);
	}
	function schedule(){
		clearTimeout(timer);
		if (!source) return;
		status.textContent = 'Calculating…';
		timer = setTimeout(() => {
			const start = performance.now();
			scores = lines(source, opts); paint();
			status.textContent = `${source.width} × ${source.height} pixels · ${Math.round(performance.now() - start)} ms. Images stay in your browser.`;
		}, 60);
	}
	function show(image){
		const scale = Math.min(1, 640 / Math.max(image.width, image.height));
		original.width = output.width = Math.max(1, Math.round(image.width * scale));
		original.height = output.height = Math.max(1, Math.round(image.height * scale));
		const ctx = original.getContext('2d', { willReadFrequently: true });
		ctx.fillStyle = 'white'; ctx.fillRect(0, 0, original.width, original.height);
		ctx.drawImage(image, 0, 0, original.width, original.height);
		source = ctx.getImageData(0, 0, original.width, original.height); scores = null;
		output.getContext('2d').fillStyle = 'white';
		output.getContext('2d').fillRect(0, 0, output.width, output.height);
		schedule();
	}
	async function load(src, token){
		const image = new Image(); image.src = src;
		try { await image.decode(); if (token === generation) show(image); }
		catch { if (token === generation) status.textContent = 'This image could not be opened. Try a PNG, JPEG or WebP file.'; }
	}
	function choose(){
		const token = ++generation;
		if (select.value === 'photo') load(new URL('../../edric/image/seagul.jpeg', import.meta.url).href, token);
		else show(sample(select.value));
	}
	function file(file){
		if (!file) return;
		if (!file.type.startsWith('image/')) { status.textContent = 'Choose an image file.'; return; }
		const url = URL.createObjectURL(file), token = ++generation;
		load(url, token).finally(() => URL.revokeObjectURL(url));
	}
	select.addEventListener('change', () => { remember(); choose(); });
	host.querySelector('input[type=file]').addEventListener('change', e => file(e.target.files[0]));
	host.addEventListener('dragover', e => { e.preventDefault(); host.classList.add('lines-dragging'); });
	host.addEventListener('dragleave', e => { if (!host.contains(e.relatedTarget)) host.classList.remove('lines-dragging'); });
	host.addEventListener('drop', e => { e.preventDefault(); host.classList.remove('lines-dragging'); file(e.dataTransfer.files[0]); });
	host.querySelector('.lines-save').addEventListener('click', () => {
		if (!scores) return;
		output.toBlob(blob => {
			if (!blob) return;
			const url = URL.createObjectURL(blob), link = document.createElement('a');
			link.href = url; link.download = 'line-art.png'; link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		});
	});
	choose();
}
