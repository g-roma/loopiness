const p5 = require("p5")

class Display{

	constructor(wrapper, width, height, data = [], stride = null){
		this.data = data;
		this.width = width;
		this.height = height;
		if(data)this.update(data, stride);
		this.p$ = new p5( (p) => {
			this.p5 = p;
			p.setup = () => {this.setup()};
			p.draw = () => {this.draw()};
		}, wrapper);

	}

	update(data, stride = null){
		if (!data || !data.length) return;
		this.data = data;
		if (!stride){
			this.nRows = 1;
			this.nCols = data.length;
		} else {
			this.nRows = Math.floor(data.length / stride);
			this.nCols = stride;
		}
		this.hStep = Math.max(1, parseInt(this.nCols / this.width));
		this.vStep = Math.max(1, parseInt(this.nRows / this.height));
	}

	setup(){
		this.p5.createCanvas(this.width, this.height);
	}

	drawLines (){
		this.p5.noSmooth();
		this.p5.noFill();
		this.p5.beginShape();
		let prevPoint = [0,this.height];
		for (var col = 0; col < this.nCols; col += this.hStep){
			let x = Math.floor(this.width * col / (this.nCols-1));
			let y = Math.floor(this.height * (1 - this.data[col]));
			let nextPoint = [x, y];
			this.p5.vertex(x,y);
			prevPoint = [x,y];
		}
		this.p5.endShape();
	}

	draw1D (){
		// TODO
	}

	draw2D(){
		// TODO
	}

	draw() {
		this.p5.clear();
		if (this.nRows == 1) this.drawLines();
		else this.draw2D();
	}
}

module.exports = Display;
