import utils from './utils';

function SpriteAnimation(...options) {
    //兼容不写new 的情况
    if (!(this instanceof SpriteAnimation)) return new SpriteAnimation(options);

    console.log('options1',options);

    this.init(options);

}

SpriteAnimation.prototype = {
    init(options){
        if (!options || !options[0] || !utils.isObject(options[1])) return new Error('this argument is wrong');

        if (!utils.$(options[0])) return new Error('can not get this Dom');

        this.ele = utils.$(options[0]);

        if(!this.ele.scrollWidth || !this.ele.scrollHeight) return new Error('this ele argument is wrong');

        this.defaultConfigOptions = {
            image: '',
            width: 0,
            height: 0,
            padding: 0,
            frames: 0,
            duration: '2s',
            loop: true,
            imageProcess(){},
            imageLoaded(){},
            animationCompleted(){},
            animationFrame(){},
        };

        this.configOptions = Object.assign(this.defaultConfigOptions, options[1]);

        utils.isString(this.configOptions.image) ? this.initCanvas().loadImage(this.configOptions.image) : this.initCanvas().loadImages(this.configOptions.image);

    },
    initCanvas(){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.ele.scrollWidth;
        this.canvas.height = this.ele.scrollHeight;
        this.ele.appendChild(this.canvas);

        return this;
    },
    loadImage(url){
        this.sourceImage = new Image();
        this.sourceImage.setAttribute('crossOrigin', 'anonymous');
        this.sourceImage.onload = () =>{
            this.sourceImageW = this.sourceImage.naturalWidth;
            this.sourceImageH = this.sourceImage.naturalHeight;
            this.getRowCol();
        };
        this.sourceImage.src = url;
    },
    loadImages(imageArr){
        this.sourceImages = [];
        let imageCount = 0;
        imageArr.length === 0 && setTimeout(() => this.configOptions.imageLoaded && this.configOptions.imageLoaded(), 0);

        imageArr.map((item, index) => {
            this.sourceImages[index] = new Image();
            this.sourceImages[index].setAttribute('crossOrigin', 'anonymous');
            this.sourceImages[index].onload = () =>{
                imageCount++;
                this.configOptions.imageProcess && this.configOptions.imageProcess((imageCount / imageArr.length).toFixed(2));
                if (imageCount === imageArr.length) {
                    this.configOptions.imageLoaded && this.configOptions.imageLoaded();

                    this.configOptions.frames = imageArr.length;
                    this.interval = utils.getRealVal(this.configOptions.duration) * 1000 / this.configOptions.frames;
                    this.thenTime = Date.now();

                    this.framesIndex = 0;
                    this.computeTime();
                }
            };
            this.sourceImages[index].src = item;
        });
    },
    getRowCol(){
        this.rowCount = Math.floor((this.sourceImageW + this.configOptions.padding) / (this.configOptions.width + this.configOptions.padding));
        this.colCount = Math.floor((this.sourceImageH + this.configOptions.padding) / (this.configOptions.height + this.configOptions.padding));

        if (this.rowCount * this.colCount < this.configOptions.frames ) return new Error('this sprite wrong');

        this.rowIndex = 1;
        this.colIndex = 1;

        this.framesIndex = 1;

        this.interval = utils.getRealVal(this.configOptions.duration) * 1000 / this.configOptions.frames;

        this.thenTime = Date.now();

        this.computeTime();
    },
    computeTime(){
        this.nowTime = Date.now();
        this.delta = this.nowTime - this.thenTime;
        this.RAF = window.requestAnimationFrame(() => this.computeTime());
        if (this.delta > this.interval){
            // 这里不能简单this.thenTime=this.nowTime，会出现细微时间差问题。例如frames=10，每帧100ms，而现在每16ms执行一次drawImage。16*7=112>100，需要7次才实际绘制一次。这个情况下，实际10帧需要112*10=1120ms>1000ms才绘制完成。
            this.thenTime = this.nowTime - (this.delta % this.interval);
            this.drawImage();
        }
    },
    drawImage(){
        if (utils.isString(this.configOptions.image)){
            this.sx = (this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding);
            this.sy = (this.colIndex - 1) * (this.configOptions.height + this.configOptions.padding);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.sourceImage, this.sx, this.sy, this.configOptions.width, this.configOptions.height, 0, 0, this.canvas.width, this.canvas.height);

            //左->右 上->下
            if ((this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding) < this.sourceImageW){
                this.rowIndex += 1;
            }
            if (this.rowIndex > this.rowCount){
                this.rowIndex = 1;
                this.colIndex += 1;
            }

            this.configOptions.animationFrame && this.configOptions.animationFrame(this.framesIndex);

            this.framesIndex ++;

            if (this.framesIndex > this.configOptions.frames && this.configOptions.loop) {
                this.rowIndex = 1;
                this.colIndex = 1;
                this.framesIndex = 1;
            }
            else if ((this.framesIndex > this.configOptions.frames) && !this.configOptions.loop){
                this.rowIndex = ((this.rowCount * this.colCount) > this.configOptions.frames ) ? ((this.configOptions.frames % this.rowCount) === 0 ? 1 : (this.configOptions.frames % this.rowCount)) :  this.rowCount;
                this.colIndex = ((this.rowCount * this.colCount) > this.configOptions.frames ) ? Math.floor(this.configOptions.frames / this.rowCount) + 1 : this.colCount;

                this.sx = (this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding);
                this.sy = (this.colIndex - 1) * (this.configOptions.height + this.configOptions.padding);

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.sourceImage, this.sx, this.sy, this.configOptions.width, this.configOptions.height, 0, 0, this.canvas.width, this.canvas.height);

                window.cancelAnimationFrame(this.RAF);

                this.configOptions.animationCompleted && this.configOptions.animationCompleted();
            }
        }
        else {
            this.sx = 0;
            this.sy = 0;
            this.sw = this.sourceImages[this.framesIndex].naturalWidth;
            this.sh = this.sourceImages[this.framesIndex].naturalHeight;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.sourceImages[this.framesIndex], this.sx, this.sy, this.sw, this.sh, 0, 0, this.canvas.width, this.canvas.height);

            this.configOptions.animationFrame && this.configOptions.animationFrame(this.framesIndex + 1);

            this.framesIndex++;

            if ((this.framesIndex === this.configOptions.frames) && this.configOptions.loop){
                this.framesIndex = 0;
            }
            else if ((this.framesIndex === this.configOptions.frames) && !this.configOptions.loop){
                window.cancelAnimationFrame(this.RAF);
                this.configOptions.animationCompleted && this.configOptions.animationCompleted();
            }
        }

    },
};

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
window.cancelAnimationFrame = (window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.clearTimeout);

export default SpriteAnimation;
