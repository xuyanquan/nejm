# NEJM

使用`babel`转化`nej`的代码为`commonjs`规范, 解决其中`this`指向`window`和依赖问题

## 实现原理

1. 将`define`函数中的依赖调整成相对路径导入
2. 将`NEJ`注入的`_p, _o, _f, _r`变量在文件前声明
3. 将`define`中直接使用的`this`变量指向`window`
4. 使用`export default`导出`define`函数的内容
5. 删除了全局变量`CMPT`和`DEBUG`相关代码
6. 删除了 patch 的支持

**由于第五点和第六点的变更, 所以不支持低版本的浏览器(也不打算支持)**

> 由于`NEJ`中存在飘忽不定的`this`指向问题, 部分`this`通过更改源码来指向`window`
>
> [变更日志](https://github.com/Mammut-FE/nejm/blob/master/src/nejRoot/CHANGELOG.md)
>
> 若发现其他文件存在`this`指向问题, 可以提`issue`或`pr`修复

## 安装

`npm i nejm --save`

## 使用

```javascript
import element from 'nejm/base/element';
import utilAjaxXdr from 'nejm/util/ajax/xhr';

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
