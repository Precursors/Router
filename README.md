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
let router = new Router()

router.route('/index', function () {
  // ...
})

router.route('/list', function () {
  // ...
})
```

### pipeline

```javascript
router.route('/index', function () {
  // ...
}).route('/list', function () {
  // ...
})
```

### multiple path handler

```javascript
router.route('/index', '/404', function () {
  // ...
})

router.route(['/index', '/404'], function () {
  // ...
})
```

### path params

```javascript
router.route('/detail/:id', function (event) {
  console.log(event.params) // { id: x }
})
```

### multiple handler

You can exec `event.preventDefault()` to terminate the execution below

```javascript
router.route('/index', function (event) {
  event.preventDefault()
}).route('/index', function (params) {
  // can not be call
})
```

#### data transmission

Get data from `event.datas`

```javascript
router.route('/index', function () {
  return 1
}).route('/index', function () {
  return {
    name: 'Niko'
  }
}).route('/index', function () {

}).route('/index', function (event) {
  console.log(event.datas)
  // [1, { name: 'Niko' }, undefined]
})
```

### async supports

```javascript
router.route('/index', async function () {
  let result = await somePromise

  return result
}).route('/index', function (event) {
  console.log(`get data: ${event.datas[0]}`)
})
```

## TODO

**Programming**  
*yes... it's just a document for now*
