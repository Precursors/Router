# Router
前端路由 基于 window.location.hash

```
npm i
npm start
```

支持对参数的获取
``` javascript
router.router('name/:id', function (params) {
  console.log(params.id);
})
```

2016/7/18:
添加 before after方法：
* 每次调用router回调前调用before，before的返回值会作为router回调的第二个参数传入
* 每次调用router回调后调用after，router的返回值会作为after的第一个参数传入
