'use strict';

function Router (win) {

  win = win || window;

  var self = this;
  var routers = self.__routers = {};  // 存储着路由的hash映射
  var location = win.location;

  /**
   * 获取或设置hash路径
   * @param  {String}           hash 可选的路径的值
   * @return {String or Router}      如果是get 返回路径的值 如果是set 返回Router实例
   */
  var pwd = self.pwd = function (hash) {

    if (hash !== undefined && hash !== null && hash !== false) {
      location.hash = hash;

      return self;
    }

    return location.hash.slice(1);  // 去掉前边的#
  }

  /**
   * 设置路由处理
   * @param  {String}   hash     要路由的hash值
   * @param  {Function} callback 路由时触发的事件
   * @return {Router}            用于链式调用
   * @TODO   后续要加上参数的匹配
   */
  var router = self.router = function (hash, callback) {

    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    var call = routers[hash] = routers[hash] || {
      events: []
    };

    // 如果设置的值存在参数的获取 需要特殊处理
    if (!call.flag && hash.indexOf(':') >= 0) {

      var params = [];

      call.flag = '$';
      call.reg = prepend(hash.replace(/\:([^\/]+)?/g, function (_, $1) {

        params.push($1);

        return '([^\/]+)?';
      }));
      call.params = params;
    }

    call.events.push(callback);

    return self;
  }

  /**
   * 手动跳转
   * @param  {String} hash 要跳转的路径
   * @return {Router}      用于链式调用
   */
  var render = self.render = function (hash) {

    return self.pwd(hash);
  }

  /**
   * 重新生成正则匹配的值
   * @param  {RegExp} old 原始的正则表达式
   * @return {RegExp}     添加^标记的正则表达式
   */
  function prepend (old) {

    if (typeof old === 'string') return prepend(new RegExp(old));

    var source = old.source;
    // 如果有^标记和$ 直接返回
    if (source.indexOf('^') === 0 && source.lastIndexOf('$') === (source.length - 1)) return old;
    return new RegExp('^' + old.source + '$', old.flags);
  }

  /**
   * 根据key来从obj中获取匹配的项
   * @param  {String} key 作为标记的key
   * @param  {Object} obj 被匹配的项
   * @return {Array}      被匹配的集合
   */
  function extract (key, obj) {

    var result = [];

    for (var hash in obj) {

      var events = obj[hash];
      // 说明存在于 使用匹配的情况 而且匹配成功了
      if (events.flag === '$' && events.reg.test(key)) {

        var keys = events.params;
        var values = key.match(events.reg).slice(1);
        var params = concat(keys, values);

        if (params) {

          result.push({
            events: events.events,
            params: params
          })
        }
      } else if (key === hash) {  // 这个表示为完全的匹配

        result.push({
          events: events.events
        });
      }
    }

    return result;
  }

  /**
   * 合并两个集合 规则为第一个集合项为key 第二个集合项为value
   * @param  {Array} keys   要作为key的一个数组
   * @param  {Array} values 要作为value的一个数组
   * @return {Object}       返回转换好的数据
   */
  function concat (keys, values) {

    var len = keys.length;
    var params = {};
    var index = 0;

    // key和value的长度相等
    if (values.length === len) {

      for (; index < len; index++) {

        params[keys[index]] = values[index];
      }

      return params;
    }

    return false;
  }

  /**
   * 循环触发回调
   * @param  {Object} events 一个包涵一些回调函数的集合
   * @param  {Object} param  任意类型 作为参数放在回调中
   */
  function fireEvent (events, param) {

    for (var index in events) {

      var call = events[index];
      call.call(self, param);
    }
  }

  // hashchange的事件
  function hashHandler () {

    var hash = self.pwd();
    var events = extract(hash, routers); // routers[hash];

    if (events.length) {

      for (var index in events) {

        fireEvent(events[index].events, events[index].params);
      }
    }
  }

  // 初始化
  function init () {

    win.addEventListener('hashchange', hashHandler);
  }

  init();

}
