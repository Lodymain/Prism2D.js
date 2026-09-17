(function (global) {

  var prism = global.prism;

  function makeScene(name) {
    var s = {
      name: name,
      data: {},
      _hooks: { enter: [], leave: [], update: [], draw: [] },

      on: function (event, fn) {
        if (!s._hooks[event]) s._hooks[event] = [];
        s._hooks[event].push(fn);
        return s;
      },

      _emit: function (event, arg) {
        var list = s._hooks[event];
        if (!list) return;
        for (var i = 0; i < list.length; i++) list[i](arg);
      },

      set: function (key, value) { s.data[key] = value; return s; },
      get: function (key) { return s.data[key]; }
    };
    return s;
  }

  prism.scene = function (name) {
    if (!prism._scenes[name]) prism._scenes[name] = makeScene(name);
    return prism._scenes[name];
  };

  prism.play = function (name) {
    var next = prism._scenes[name];
    if (!next) {
      console.warn("Prism2D: scene '" + name + "' not found");
      return prism;
    }
    if (prism._currentScene && prism._currentScene._emit) prism._currentScene._emit("leave");
    prism._currentScene = next;
    next._emit("enter");
    return prism;
  };

  prism.current = function () { return prism._currentScene; };

})(typeof window !== "undefined" ? window : this);
