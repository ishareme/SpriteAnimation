(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SpriteAnimation = factory());
}(this, (function () { 'use strict';

var utils = {
    //判断对象
    isObject: function isObject(obj) {
        //{},[],null 用typeof检测不出来
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isString: function isString(val) {
        return typeof val === 'string';
    },
    isNumber: function isNumber(val) {
        //isFinite 检测是否为无穷大
        //isNumber(parseInt(a))   // true
        // 第一种写法
        return typeof val === 'number' && isFinite(val);
        //第二种写法
        // return typeof val === 'number' && !isNaN(val)
    },
    isPx: function isPx(val) {
        return this.isString(val) && val.trim().endsWith('px');
    },
    isSecond: function isSecond(val) {
        return this.isString(val) && val.trim().endsWith('s');
    },
    $: function $(ele) {
        if (document.querySelector) {
            return document.querySelector(ele);
        } else {
            if (ele.indexOf('#') > -1) {
                return document.getElementById(ele.replace('#', ''));
            } else if (ele.indexOf('.') > -1) {
                return document.getElementsByClassName(ele.replace('.', ''))[0];
            } else {
                return document.getElementsByTagName(ele)[0];
            }
        }
    },
    getRealVal: function getRealVal(val) {
        return parseInt(val);
    }
};

function SpriteAnimation() {
    for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
        options[_key] = arguments[_key];
    }

    //兼容不写new 的情况
    if (!(this instanceof SpriteAnimation)) return new SpriteAnimation(options);

    console.log('options1', options);

    this.init(options);
}

SpriteAnimation.prototype = {
    init: function init(options) {
        if (!options || !options[0] || !utils.isObject(options[1])) return new Error('this argument is wrong');

        if (!utils.$(options[0])) return new Error('can not get this Dom');

        this.ele = utils.$(options[0]);

        if (!this.ele.scrollWidth || !this.ele.scrollHeight) return new Error('this ele argument is wrong');

        this.defaultConfigOptions = {
            image: '',
            width: 0,
            height: 0,
            padding: 0,
            frames: 0,
            duration: '2s',
            loop: true,
            imageProcess: function imageProcess() {},
            imageLoaded: function imageLoaded() {},
            animationCompleted: function animationCompleted() {},
            animationFrame: function animationFrame() {}
        };

        this.configOptions = Object.assign(this.defaultConfigOptions, options[1]);

        utils.isString(this.configOptions.image) ? this.initCanvas().loadImage(this.configOptions.image) : this.initCanvas().loadImages(this.configOptions.image);
    },
    initCanvas: function initCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.ele.scrollWidth;
        this.canvas.height = this.ele.scrollHeight;
        this.ele.appendChild(this.canvas);

        return this;
    },
    loadImage: function loadImage(url) {
        var _this = this;

        this.sourceImage = new Image();
        this.sourceImage.setAttribute('crossOrigin', 'anonymous');
        this.sourceImage.onload = function () {
            _this.sourceImageW = _this.sourceImage.naturalWidth;
            _this.sourceImageH = _this.sourceImage.naturalHeight;
            _this.configOptions.imageLoaded && _this.configOptions.imageLoaded();
            _this.getRowCol();
        };
        this.sourceImage.src = url;
    },
    loadImages: function loadImages(imageArr) {
        var _this2 = this;

        this.sourceImages = [];
        var imageCount = 0;
        imageArr.length === 0 && setTimeout(function () {
            return _this2.configOptions.imageLoaded && _this2.configOptions.imageLoaded();
        }, 0);

        imageArr.map(function (item, index) {
            _this2.sourceImages[index] = new Image();
            _this2.sourceImages[index].setAttribute('crossOrigin', 'anonymous');
            _this2.sourceImages[index].onload = function () {
                imageCount++;
                _this2.configOptions.imageProcess && _this2.configOptions.imageProcess((imageCount / imageArr.length).toFixed(2));
                if (imageCount === imageArr.length) {
                    _this2.configOptions.imageLoaded && _this2.configOptions.imageLoaded();

                    _this2.configOptions.frames = imageArr.length;
                    _this2.interval = utils.getRealVal(_this2.configOptions.duration) * 1000 / _this2.configOptions.frames;
                    _this2.thenTime = Date.now();

                    _this2.framesIndex = 0;
                    _this2.computeTime();
                }
            };
            _this2.sourceImages[index].src = item;
        });
    },
    getRowCol: function getRowCol() {
        this.rowCount = Math.floor((this.sourceImageW + this.configOptions.padding) / (this.configOptions.width + this.configOptions.padding));
        this.colCount = Math.floor((this.sourceImageH + this.configOptions.padding) / (this.configOptions.height + this.configOptions.padding));

        if (this.rowCount * this.colCount < this.configOptions.frames) return new Error('this sprite wrong');

        this.rowIndex = 1;
        this.colIndex = 1;

        this.framesIndex = 1;

        this.interval = utils.getRealVal(this.configOptions.duration) * 1000 / this.configOptions.frames;

        this.thenTime = Date.now();

        this.computeTime();
    },
    computeTime: function computeTime() {
        var _this3 = this;

        this.nowTime = Date.now();
        this.delta = this.nowTime - this.thenTime;
        this.RAF = window.requestAnimationFrame(function () {
            return _this3.computeTime();
        });
        if (this.delta > this.interval) {
            // 这里不能简单this.thenTime=this.nowTime，会出现细微时间差问题。例如frames=10，每帧100ms，而现在每16ms执行一次drawImage。16*7=112>100，需要7次才实际绘制一次。这个情况下，实际10帧需要112*10=1120ms>1000ms才绘制完成。
            this.thenTime = this.nowTime - this.delta % this.interval;
            this.drawImage();
        }
    },
    drawImage: function drawImage() {
        if (utils.isString(this.configOptions.image)) {
            this.sx = (this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding);
            this.sy = (this.colIndex - 1) * (this.configOptions.height + this.configOptions.padding);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.sourceImage, this.sx, this.sy, this.configOptions.width, this.configOptions.height, 0, 0, this.canvas.width, this.canvas.height);

            //左->右 上->下
            if ((this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding) < this.sourceImageW) {
                this.rowIndex += 1;
            }
            if (this.rowIndex > this.rowCount) {
                this.rowIndex = 1;
                this.colIndex += 1;
            }

            this.configOptions.animationFrame && this.configOptions.animationFrame(this.framesIndex);

            this.framesIndex++;

            if (this.framesIndex > this.configOptions.frames && this.configOptions.loop) {
                this.rowIndex = 1;
                this.colIndex = 1;
                this.framesIndex = 1;
            } else if (this.framesIndex > this.configOptions.frames && !this.configOptions.loop) {
                this.rowIndex = this.rowCount * this.colCount > this.configOptions.frames ? this.configOptions.frames % this.rowCount === 0 ? 1 : this.configOptions.frames % this.rowCount : this.rowCount;
                this.colIndex = this.rowCount * this.colCount > this.configOptions.frames ? Math.floor(this.configOptions.frames / this.rowCount) + 1 : this.colCount;

                this.sx = (this.rowIndex - 1) * (this.configOptions.width + this.configOptions.padding);
                this.sy = (this.colIndex - 1) * (this.configOptions.height + this.configOptions.padding);

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.sourceImage, this.sx, this.sy, this.configOptions.width, this.configOptions.height, 0, 0, this.canvas.width, this.canvas.height);

                window.cancelAnimationFrame(this.RAF);

                this.configOptions.animationCompleted && this.configOptions.animationCompleted();
            }
        } else {
            this.sx = 0;
            this.sy = 0;
            this.sw = this.sourceImages[this.framesIndex].naturalWidth;
            this.sh = this.sourceImages[this.framesIndex].naturalHeight;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.sourceImages[this.framesIndex], this.sx, this.sy, this.sw, this.sh, 0, 0, this.canvas.width, this.canvas.height);

            this.configOptions.animationFrame && this.configOptions.animationFrame(this.framesIndex + 1);

            this.framesIndex++;

            if (this.framesIndex === this.configOptions.frames && this.configOptions.loop) {
                this.framesIndex = 0;
            } else if (this.framesIndex === this.configOptions.frames && !this.configOptions.loop) {
                window.cancelAnimationFrame(this.RAF);
                this.configOptions.animationCompleted && this.configOptions.animationCompleted();
            }
        }
    }
};

window.requestAnimationFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
}();
window.cancelAnimationFrame = window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.clearTimeout;

return SpriteAnimation;

})));
