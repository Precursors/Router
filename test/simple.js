
  // test code
  let router = new Router()

  router.redirect('/a/b')
  router.redirect('/a/:b', {
    b: 123
  })
  router.redirect('/a/:b/c/:d', {
    b: 123,
    d: 233
  })

  let handler2 = event => {
    console.log(event, 2)
  }

  let handler3 = event => {
    console.log(event, 3)
  }

  router
  .addRoute('/index/list', async event => {
    console.log(event, 1)
    await delay()
    return '1call'
  })
  .addRoute(['/index/:path1', '/index/:path2'], handler2)
  .addRoute('/index/:path3', '/index/:path4', handler3)
  .addRoute('/index/list', event => {
    console.log(event, 4)
  })
  .removeRoute('/index/:path1', handler2)
  .removeRoute(['/index/:path3', '/index/:path4'], handler3)
  .unknown(_ => console.log('unknown call'))

  location.hash = '/index/list'
  function delay () {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000)
    })
  }
  // test code end
