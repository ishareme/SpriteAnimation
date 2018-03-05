export default {
    //判断对象
    isObject: function (obj) {
        //{},[],null 用typeof检测不出来
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isString(val) {
        return typeof val === 'string';
    },
    isNumber(val) {
        //isFinite 检测是否为无穷大
        //isNumber(parseInt(a))   // true
        // 第一种写法
        return typeof val === 'number' && isFinite(val);
        //第二种写法
        // return typeof val === 'number' && !isNaN(val)
    },
    isPx(val){
        return this.isString(val) && val.trim().endsWith('px');
    },
    isSecond(val){
        return this.isString(val) && val.trim().endsWith('s');
    },

    $(ele){
        if(document.querySelector){
            return document.querySelector(ele);
        } else {
            if (ele.indexOf('#') > -1){
                return document.getElementById(ele.replace('#',''));
            } else if (ele.indexOf('.') > -1){
                return document.getElementsByClassName(ele.replace('.',''))[0];
            } else {
                return document.getElementsByTagName(ele)[0];
            }
        }
    },
    getRealVal(val){
        return parseInt(val);
    },

};