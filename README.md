# Router
frontend router base on `window.location.hash`

## Installation

### with webpack

```bash
npm install hash-routers
```

### simple script
```html
<script src="./src/Router.js"></script>
```

## Documents

### base

```javascript
import Router from 'hash-routers'
// const Router = require('hash-routers')
// const Router = window.Router

let router = new Router()

router.addRoute('/index', function () {
  // ...
})

router.addRoute('/list', function () {
  // ...
})
```

### pipeline

```javascript
router.addRoute('/index', function () {
  // ...
}).addRoute('/list', function () {
  // ...
})
```

### multiple path handler

```javascript
router.addRoute('/index', '/404', function () {
  // ...
})

router.addRoute(['/index', '/404'], function () {
  // ...
})
```

### path params

```javascript
router.addRoute('/detail/:id', function (event) {
  console.log(event.params) // { id: x }
})
```

### multiple handler

You can exec `event.preventDefault()` to terminate the execution below

```javascript
router.addRoute('/index', function (event) {
  event.preventDefault()
}).addRoute('/index', function (params) {
  // can not be call
})
```

#### data transmission

Get data from `event.datas`

```javascript
router.addRoute('/index', function () {
  return 1
}).addRoute('/index', function () {
  return {
    name: 'Niko'
  }
}).addRoute('/index', function () {

}).addRoute('/index', function (event) {
  console.log(event.datas)
  // [1, { name: 'Niko' }, undefined]
})
```

### async supports

```javascript
router.addRoute('/index', async function () {
  let result = await somePromise

  return result
}).addRoute('/index', function (event) {
  console.log(`get data: ${event.datas[0]}`)
})
```

### remove handlers

seem syntax like `addRoute`

```javascript
let handler = function () {
  // just call on page2
}
router.addRoute(['/page1', '/page2', '/page3'], handler)

router.removeRoute('/page1', '/page3', handler)
```

### jump to path

```javascript
router.addRoute('/page1', function () {

})

router.jump('/page1')
```

#### jump path with params

```javascript
router.addRoute('/user/:uid', function (event) {
  console.log(`got data: ${event.params}`) // got data: { uid: 1 }
})

router.jump('/user/:uid', {
  uid: 1
})
```

### unknown handler

```javascript
router.unknown(function (path) {
  console.log(`unknown path: ${path}`)
})
```

## TODO

**Programming**  
*yes... it's just a document for now*
