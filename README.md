# NEJM

采用 ES2015 Module 的方式重新组织了NEJ，目的是为了能够在NEJ的项目中使用 ES6

更多信息访问 [如何在nej中优雅的使用 ES6](https://github.com/Mammut-FE/babel-plugin-transform-es2015-modules-nejm)



## 安装

使用`npm`或者`yarn`安装

```
npm i nejm --save-dev

yarn add nejm --dev
```



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



## 关于本项目

本项目使用考拉前端的 [nejc](https://github.com/kaola-fed/nejc) 进行转换的，具体配置信息可以那个项目查看

我主要是将导出的换成`ES6`，由于我所在的项目组中比没有使用NEJ的平台依赖系统，所以并不能保证这一部分的正确

由于NEJ提供的API有很多，这个项目并**没有将所有的API都有导出**

在`template/NEJ.INDEX.js`有详细的导出信息，如果不能满足你项目的需求，你可以`fork`本项目，添加你所需要的API后发送`Pull request`即可