# NEJM

使用`babel`转化`nej`的代码为`commonjs`规范, 解决其中`this`指向`window`和依赖问题


## 安装

`npm i nejm --save`

## 使用

```javascript
import * as element from 'nejm/base/element';
import * as utilAjaxXdr from 'nejm/util/ajax/xhr';

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
