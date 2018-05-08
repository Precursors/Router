(() => {
  class RouterEvent {
    constructor ({
      datas = [],
      params = {}
    } = {}) {
      this.params = params
      this.datas = datas
    }

    preventDefault () {
      this.cancel = true
    }
  }

  class Router {
    constructor (context = window) {
      this.context = context
      this.changeHandler = this.changeHandler.bind(this)
      this.pathHandlers = []

      this.init()
    }

    init () {
      let {context} = this

      context.removeEventListener('hashchange', this.changeHandler)
      context.addEventListener('hashchange', this.changeHandler)
    }

    async changeHandler () {
      let {context, pathHandlers} = this
      let {hash} = context.location
      let datas = []
      let notFound = true

      for (let pathInfo of pathHandlers)  {
        let {pathReg, callback} = pathInfo
        if (pathReg.test(hash)) {
          notFound = false

          let routerEvent = new RouterEvent({
            params: pathReg.exec(hash).groups,
            datas
          })
          let result = await callback(routerEvent)
          if (routerEvent.cancel) {
            break
          }

          datas.push(result)
        }
      }

      if (notFound) {
        this.unknownCallback && this.unknownCallback(hash.slice(1))
      }
    }

    addRoute (...paths) {
      let [callback] = paths.splice(-1)

      paths = [].concat(...paths)

      paths.forEach(path => {
        this.bindEvent(path, callback)
      })

      return this
    }

    removeRoute (...paths) {
      let [callback] = paths.splice(-1)

      paths = [].concat(...paths)

      paths.forEach(path => {
        this.unbindEvent(path, callback)
      })

      return this
    }

    unknown (unknownCallback) {
      this.unknownCallback = unknownCallback

      return this
    }

    /**
     * redirect to
     * @param  {String} path   template path
     * @param  {Object} params replace params in path
     */
    redirect (path, params = {}) {
      path = `#${path}`.replace(/(?<=\/):(\w*?)(?=(\/|$))/g, (_, $1) => params[$1])

      this.context.hash = path

      return this
    }

    bindEvent (path, callback) {
      let pathReg = new RegExp(`^#${path}\/?$`.replace(/(?<=\/):(\w*?)(?=(\/|$))/g, '(?<$1>\\w*?)')) // planb: .replace(/(\/):(\w*?)(?=\/)/g, '$1(?<$2>\\w*?)')

      this.pathHandlers.push({
        path,
        pathReg,
        callback
      })
    }

    unbindEvent (path, callback) {
      let targetIndex = 0
      if (this.pathHandlers.some((item, index) => {
        if (path === item.path && callback === item.callback) {
          targetIndex = index
          return true
        }
      })) {
        this.pathHandlers.splice(targetIndex, 1)
      }
    }
  }

  // init
  if (typeof window !== 'undefined') {
    window.Router = Router
  } else if (typeof module !== 'undefined') {
    module.exports = Router
  } else {
    return Router
  }
})()
