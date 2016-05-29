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

    var calls = routers[hash] = routers[hash] || [];

    calls.push(callback);

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

  // hashchange的事件
  function hashHandler () {

    var hash = self.pwd();
    var calls = routers[hash];

    if (calls) {
      for (var index in calls) {

        var call = calls[index];
        call.call(self);

      }
    }

  }

  // 初始化
  function init () {

    win.addEventListener('hashchange', hashHandler);
  }

  init();

}
