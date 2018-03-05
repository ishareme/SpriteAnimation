(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.example = factory());
}(this, (function () { 'use strict';

function meitu() {
    console.log('meitu');
}

return meitu;

})));
