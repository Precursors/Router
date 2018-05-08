(() => {
  const assist = ['before', 'after']
  /**
   * 为当前实例生成before和after事件
   * @param  {Router} self Router的实例
   * @return {Router}      Router的实例
   */
  const buildAssist = self => {
    for (let item of assist) {
      self[item] = callback => {
        if (typeof callback !== 'function') throw new Error('callback must be a function')
        self[`${item}Func`] = callback
        return self
      }
      self[`${item}Func`] = () => {}
    }

    return self
  }

  /**
   * 重新生成正则匹配的值
   * @param  {RegExp} old 原始的正则表达式
   * @return {RegExp}     添加^标记的正则表达式
   */
  const prepend = (old) => {
    if (typeof old === 'string') return prepend(new RegExp(old))

    let {source, flags} = old

    // 如果有^标记和$ 直接返回
    if (source.indexOf('^') === 0 && source.lastIndexOf('$') === (source.length - 1)) return old

    // 否则 返回添加了 ^ 和  $ 标记的正则对象
    return new RegExp('^' + source + '$', flags)
  }

  /**
   * 根据key来从obj中获取匹配的项
   * @param  {String} key 作为标记的key
   * @param  {Object} obj 被匹配的项
   * @return {Array}      被匹配的集合
   */
  const extract = (key, obj) => {
    let result = []

    for (let hash in obj) {
      let events = obj[hash]

      // 说明存在于 使用匹配的情况 而且匹配成功了
      if (events.flag === '$' && events.reg.test(key)) {
        let keys = events.params
        let values = key.match(events.reg).slice(1)
        let params = concat(keys, values)

        if (params) {
          result.push({
            events: events.events,
            params: params
          })
        }
      } else if (key === hash) {
        // 这个表示为不涉及包涵参数的匹配
        result.push({
          events: events.events
        })
      }
    }

    return result
  }

  /**
   * 合并两个集合 规则为第一个集合项为key 第二个集合项为value
   * @param  {Array} keys   要作为key的一个数组
   * @param  {Array} values 要作为value的一个数组
   * @return {Object}       返回转换好的数据
   */
  const concat = (keys, values) => {
    let len = keys.length
    let params = {}
    let index = 0

    // 只有在key和value的长度相等时才会进行赋值并返回
    if (values.length === len) {
      for (; index < len; index++) {
        params[keys[index]] = values[index]
      }

      return params
    }

    return false
  }

  // 初始化
  const init = (context, hashHandler) => {
    context.removeEventListener('hashchange', hashHandler)
    context.addEventListener('hashchange', hashHandler)
  }

  class Router {
    constructor (context) {
      this.context = this.context || window
      this.__routers = {}
      this.location = context.location
      this.notfound = null

      buildAssist(this)
      init(context, this.hold.bind(this))
    }

    pwd (hash) {
      let {location} = this
      if (hash !== undefined && hash !== null && hash !== false) {
        location.hash = hash

        return this
      }

      return location.hash.slice(1)  // 去掉前边的#
    }

    router (hash, callback) {
      if (typeof callback !== 'function') {
        throw new Error('callback must be a function')
      }

      let call = this.__routers[hash] = this.__routers[hash] || {
        events: []
      }

      // 如果设置的值存在参数的获取 需要特殊处理
      if (!call.flag && hash.includes(':')) {
        let params = []

        call.flag = '$'
        call.reg = prepend(hash.replace(/:([^/]+)?/g, (_, $1) => {
          // 把参数一个个择出来 并存在该路由信息中的params属性中
          params.push($1)

          // 把原路径中的:XXX改为 ([^\/]+)?
          // 原串：
          //    name/:id/:age
          // 转换后：
          //    name/([^\/]+)?/([^\/]+)?
          // 所以 params的顺序很重要。。。
          return '([^/]+)?'
        }))

        call.params = params
      }

      call.events.push(callback)

      return this
    }

    /**
     * 设置未匹配的路由回调
     * @param  {Function} callback 如果触发了未匹配的路由 则会执行该function
     * @return {Router}            用于链式调用
     */
    unknown (callback) {
      this.notfound = callback

      return this
    }

    // hashchange的事件 也可手动触发
    hold () {
      let {__routers: routers, notfound} = this
      let hash = this.pwd()
      let events = extract(hash, routers) // routers[hash];

      if (events.length) {
        for (let eve of events) {
          this.fireEvent(eve.events, eve.params)
        }
      } else {
        // 如果没有匹配到 执行可能会设置的默认的路由
        notfound && this.fireEvent([notfound])
      }
    }

    /**
     * 手动跳转
     * @param  {String} hash 要跳转的路径
     * @return {Router}      用于链式调用
     */
    render (hash) {
      return this.pwd(hash)
    }

    /**
     * 循环触发回调
     * @param  {Object} events 一个包涵一些回调函数的集合
     * @param  {Object} param  任意类型 作为参数放在回调中
     */
    fireEvent (events, param) {
      let {afterFunc, beforeFunc} = this
      for (let cb of events) {
        afterFunc.call(this, cb.call(this, param, beforeFunc.call(this)))
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
