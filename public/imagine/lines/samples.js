export function sample(name){
	const canvas = document.createElement('canvas');
	canvas.width = 560; canvas.height = 400;
	const c = canvas.getContext('2d');
	c.fillStyle = '#f5f4ef'; c.fillRect(0, 0, canvas.width, canvas.height);
	c.lineWidth = 2; c.strokeStyle = '#64615a';
	const segment = (a, b) => { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); };
	if (name === 'box'){
		const points = [[130,145],[355,145],[355,335],[130,335],[215,65],[440,65],[440,255],[215,255]];
		for (const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]) segment(points[a],points[b]);
	} else if (name === 'room'){
		c.fillStyle = '#dedbd3'; c.fillRect(140,85,280,225);
		for (const [a,b] of [[[140,85],[420,85]],[[420,85],[420,310]],[[420,310],[140,310]],[[140,310],[140,85]],[[0,0],[140,85]],[[560,0],[420,85]],[[0,400],[140,310]],[[560,400],[420,310]]]) segment(a,b);
		c.strokeRect(205,130,90,180); c.strokeRect(330,135,55,80);
	} else {
		c.fillStyle = '#cccccc'; c.fillRect(0,0,280,400);
		c.fillStyle = '#d0d0d0'; c.fillRect(280,0,280,400);
		let seed = 42;
		const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296; };
		const pixels = c.getImageData(0,0,560,400);
		for (let y=240;y<370;y++) for(let x=30;x<530;x++){
			const i=(y*560+x)*4, v=160+Math.round(random()*80);
			pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;
		}
		c.putImageData(pixels,0,0);
	}
	return canvas;
}
