(function (global) {

  var prism = global.prism;

  prism._getCanvasPos = function (cx, cy) {
    var rect = prism.canvas.getBoundingClientRect();
    var dpr = (prism._quality === "master") ? prism._dpr : 1;
    return {
      x: (cx - rect.left) * (prism.canvas.width / rect.width) / dpr,
      y: (cy - rect.top) * (prism.canvas.height / rect.height) / dpr
    };
  };

  prism._setupInput = function () {
    var canvas = prism.canvas;
    if (!canvas) return;

    window.addEventListener("keydown", function (e) {
      if (!prism._keys[e.key]) {
        prism._keysNew[e.key] = true;
        prism._keysNew[e.code] = true;
      }
      prism._keys[e.key] = true;
      prism._keys[e.code] = true;
    });

    window.addEventListener("keyup", function (e) {
      prism._keys[e.key] = false;
      prism._keys[e.code] = false;
      prism._keysNewUp[e.key] = true;
      prism._keysNewUp[e.code] = true;
    });

    canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var p = prism._getCanvasPos(e.clientX, e.clientY);
      prism._mouse.x = p.x;
      prism._mouse.y = p.y;
      prism._mouse.down = true;
      prism._mouseNewPress = true;
      prism._mouse.button = e.button;
    });

    canvas.addEventListener("mousemove", function (e) {
      var p = prism._getCanvasPos(e.clientX, e.clientY);
      prism._mouse.x = p.x;
      prism._mouse.y = p.y;
    });

    canvas.addEventListener("mouseup", function (e) {
      var p = prism._getCanvasPos(e.clientX, e.clientY);
      prism._mouse.x = p.x;
      prism._mouse.y = p.y;
      prism._mouse.down = false;
      prism._mouseNewRelease = true;
    });

    canvas.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    canvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      prism._touchActive = true;
      prism._updateTouches(e.touches);
      if (e.touches.length > 0) {
        var p = prism._getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
        prism._mouse.x = p.x;
        prism._mouse.y = p.y;
        prism._mouse.down = true;
        prism._mouseNewPress = true;
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      prism._updateTouches(e.touches);
      if (e.touches.length > 0) {
        var p = prism._getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
        prism._mouse.x = p.x;
        prism._mouse.y = p.y;
      }
    }, { passive: false });

    canvas.addEventListener("touchend", function (e) {
      e.preventDefault();
      prism._updateTouches(e.touches);
      if (e.touches.length === 0) {
        prism._mouse.down = false;
        prism._mouseNewRelease = true;
        prism._touchActive = false;
      } else {
        var p = prism._getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
        prism._mouse.x = p.x;
        prism._mouse.y = p.y;
      }
    }, { passive: false });

    canvas.addEventListener("touchcancel", function (e) {
      e.preventDefault();
      prism._mouse.down = false;
      prism._mouseNewRelease = true;
      prism._touchActive = false;
      prism._touches = [];
    }, { passive: false });
  };

  prism._updateTouches = function (list) {
    prism._touches = [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      var p = prism._getCanvasPos(t.clientX, t.clientY);
      prism._touches.push({ x: p.x, y: p.y, id: t.identifier, index: i });
    }
  };

  prism._syncInput = function () {
    prism._mouse.justPressed = prism._mouseNewPress;
    prism._mouse.justReleased = prism._mouseNewRelease;
    prism._mouseNewPress = false;
    prism._mouseNewRelease = false;
    prism._keysPressed = prism._keysNew;
    prism._keysReleased = prism._keysNewUp;
    prism._keysNew = {};
    prism._keysNewUp = {};
  };

  prism._clearFrameInput = function () {
    prism._mouse.justPressed = false;
    prism._mouse.justReleased = false;
    prism._keysPressed = {};
    prism._keysReleased = {};
  };

  prism.key = function (k) { return prism._keys[k] === true; };
  prism.keyHit = function (k) { return prism._keysPressed[k] === true; };
  prism.keyUp = function (k) { return prism._keysReleased[k] === true; };

  prism.axisX = function () {
    var v = 0;
    if (prism.key("ArrowLeft") || prism.key("KeyA") || prism.key("a")) v -= 1;
    if (prism.key("ArrowRight") || prism.key("KeyD") || prism.key("d")) v += 1;
    return v;
  };

  prism.axisY = function () {
    var v = 0;
    if (prism.key("ArrowUp") || prism.key("KeyW") || prism.key("w")) v -= 1;
    if (prism.key("ArrowDown") || prism.key("KeyS") || prism.key("s")) v += 1;
    return v;
  };

  prism.mouse = {
    x: function () { return prism._mouse.x; },
    y: function () { return prism._mouse.y; },
    down: function () { return prism._mouse.down; },
    hit: function () { return prism._mouse.justPressed; },
    up: function () { return prism._mouse.justReleased; },
    button: function () { return prism._mouse.button || 0; },
    worldX: function () {
      var c = prism._activeCamera;
      return c ? prism.toWorld(c, prism._mouse.x, prism._mouse.y).x : prism._mouse.x;
    },
    worldY: function () {
      var c = prism._activeCamera;
      return c ? prism.toWorld(c, prism._mouse.x, prism._mouse.y).y : prism._mouse.y;
    }
  };

  prism.touches = function () { return prism._touches.slice(); };
  prism.isTouch = function () { return "ontouchstart" in window || navigator.maxTouchPoints > 0; };
  prism.touchCount = function () { return prism._touches.length; };

  prism.touchPos = function (index) {
    var t = prism._touches[index || 0];
    return t ? { x: t.x, y: t.y } : null;
  };

})(typeof window !== "undefined" ? window : this);
