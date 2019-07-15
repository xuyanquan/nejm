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
