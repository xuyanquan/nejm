#NEJ 源文件修改历史

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

2. `base/global.js#156~161`

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
