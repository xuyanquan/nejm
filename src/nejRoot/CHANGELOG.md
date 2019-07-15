# NEJ 源文件修改历史

1. `base/platform/element.js#241~242`

```javascript
// old
_u._$forIn(_klss,function(_name){
    if (!!this[_name]){
        _mtrx = new this[_name](_matrix||'');
        return !0;
    }
});

// new
_u._$forIn(_klss,function(_name){
    if (!!window[_name]){
        _mtrx = new window[_name](_matrix||'');
        return !0;
    }
});
```

2. `base/global.js#156~161` this 指向问题

```javascript
// old
if (!this.console){
    this.console = {
        log:_f,
        error:_f
    };
}

// new
if (!window.console){
    window.console = {
        log:_f,
        error:_f
    };
}
```

3. `base/platform/config.js#100` this 指向问题

```javascript
// old
_doInit(this.NEJ_CONF||_o);

// new
_doInit(window.NEJ_CONF||_o);
``` 

4. `util/ajax/platform/xdr.js#8~13` 删除 ajax 中 flash 的引用 (后期视情况添加)
```javascript
// old
NEJ.define([
    '../proxy/xhr.js',
    '../proxy/flash.js',
    '../proxy/frame.js',
    '../proxy/upload.js'
],function(_t0,_t1,_t2,_t3,_p,_o,_f,_r){

// new
NEJ.define([
    '../proxy/xhr.js',
    '../proxy/frame.js',
    '../proxy/upload.js'
],function(_t0,_t2,_t3,_p,_o,_f,_r){
```
