# SpriteAnimation

> [git](https://github.com/ishareme/SpriteAnimation)

> [npm](http://npm.meitu-int.com/#@meitu/SpriteAnimation)

## Example

[example](http://f2er.meitu.com/hmz/SpriteAnimation/example)

## Getting Started
 
 ```shell
 npm set registry http://npm.meitu-int.com 
 ```
 
 ```shell
 npm i @meitu/SpriteAnimation --save
 ```

 ```shell
 import ClipImage from '@meitu/SpriteAnimation';
 ```
 
 
####  new SpriteAnimation(ele,options) || SpriteAnimation(ele, options):

```sh
    //承载动画的盒子
    ele [String]: '#id' ， '.class' , '元素'
    // options [Object] 配置参数
    options:{
        //提供的精灵图 url, or 一系列图片的数组
        
        image [String or Array]: '' || [],
        
        //当image为Array时，可不传width 、 height 、padding、frames， 默认为每张图片的宽高
        //当image为String时，必填
        //小精灵的宽高
        width [Number or String]: 0, //100 or '100px'
        height: 0,
        
        //精灵与精灵的间距 [默认为0]
        padding: 0, // 100 or '100px'
        
        // 总帧数
        frames [Number]: 0, 
        
        //完成动画所花费的时间，以秒计
        duration [Number or String]: 0, // 2 or '2s'
        
        //是否循环播放
        loop [Boolean]: true,
        
        //加载图片的进度钩子 通常用于image为数组
        imageProcess(){},
        
        //图片加载完成的钩子
        imageLoaded(){},
        
        //当loop为false 动画加载完成钩子
        animationCompleted(){},
        
        //帧回调
        animationFrame(){},
    }
```

## Basic Usage
```sh
SpriteAnimation


、
new SpriteAnimation('#test',{
    // image: './images/deco.png', // url or Array
    image:[
            './images/sprites/001.png',
            './images/sprites/002.png',
            './images/sprites/003.png',
            './images/sprites/004.png',
            './images/sprites/005.png',
            './images/sprites/006.png',
            './images/sprites/007.png',
            './images/sprites/008.png',
            './images/sprites/009.png',
            './images/sprites/010.png',
            './images/sprites/011.png',
            './images/sprites/012.png',
            './images/sprites/013.png',
            './images/sprites/014.png',
            './images/sprites/015.png',
            './images/sprites/016.png',
            './images/sprites/017.png',
            './images/sprites/018.png',
            './images/sprites/019.png',
            './images/sprites/020.png',
            './images/sprites/021.png',
            './images/sprites/022.png',
            './images/sprites/023.png',
            './images/sprites/024.png',
            './images/sprites/025.png',
            './images/sprites/026.png',
            './images/sprites/027.png',
        ],
    width: 480,
    height: 480,
    frames: 20,
    padding: 0,
    duration: '2s',
    loop: true,
    imageProcess(val){
        // console.log(val)
    },
    imageLoaded(){
        console.log('loaded')
    },
    animationCompleted(){},
    animationFrame(){},
})


or


new SpriteAnimation('#test2',{
    // image: './images/deco.png', // url or Array
    image:'./images/deco.png
    width: 480,
    height: 480,
    frames: 20,
    padding: 0,
    duration: '5s',
    loop: true,
    imageProcess(val){
        // console.log(val)
    },
    imageLoaded(){
        console.log('loaded')
    },
    animationCompleted(){},
    animationFrame(){},
})

```


