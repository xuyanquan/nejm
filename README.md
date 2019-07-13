# NEJM

使用`babel`转化`nej`的代码为`commonjs`规范, 解决其中`this`指向`window`和依赖问题


## 安装


## 使用

```javascript
import {
    element,
    utilAjaxXdr
} from './nej-es6';

utilAjaxXdr._$request({
    method: 'post',
    data: {
		param: "data"
    },
    success: function (res) {
        const showElement = element._$get('box');
        showElement.innerHTML = res.message;
    }
});
```
