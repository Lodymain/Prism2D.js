(function (global) {

  var prism = function (w, h, parent) {
    return prism.init({ width: w, height: h, parent: parent });
  };content://com.android.externalstorage.documents/tree/primary%3Aprism2D::primary:prism2D/game-test/prism2d.js

  prism.version = "1.0.0";
  prism.canvas = null;
  prism.ctx = null;
  prism.width = 0;
  prism.height = 0;
  prism.background = "#000";
  prism.autoClear = true;

  prism._lastTime = 0;
  prism._accumulator = 0;
  prism._timestep = 1000 / 60;
  prism._rafId = null;
  prism._running = false;
  prism._alpha = 0;

  prism._hooks = { update: [], draw: [], init: [], resize: [] };

  prism._mode = "pixel";
  prism._quality = "canvas";
  prism._pixelSnap = true;
  prism._dpr = 1;
  prism._scaleMode = "fit";
  prism._cssWidth = 0;
  prism._cssHeight = 0;
  prism._interpolate = true;

  prism._scenes = {};
  prism._currentScene = null;

  prism._gravity = { x: 0, y: 0 };
  prism._bodies = [];
  prism._groups = {};
  prism._contacts = {};
  prism._activeCamera = null;
  prism._images = {};
  prism._audioCtx = null;
  prism._sounds = {};

  prism._keys = {};
  prism._keysPressed = {};
  prism._keysReleased = {};
  prism._keysNew = {};
  prism._keysNewUp = {};
  prism._mouse = { x: 0, y: 0, down: false, justPressed: false, justReleased: false, button: 0 };
  prism._mouseNewPress = false;
  prism._mouseNewRelease = false;
  prism._touches = [];
  prism._touchActive = false;

  prism._timers = [];
  prism._particles = [];

  global.prism = prism;

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism.init = function (config) {
    config = config || {};
    var w = config.width || 800;
    var h = config.height || 600;
    var parent = config.parent || document.body;
    var bg = config.background || "#000";
    var mode = config.mode || "pixel";
    var quality = config.quality || "canvas";

    var canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    canvas.style.background = bg;
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";
    canvas.style.webkitUserSelect = "none";
    canvas.style.webkitTapHighlightColor = "transparent";
    canvas.style.outline = "none";
    canvas.style.msTouchAction = "none";

    if (typeof parent === "string") {
      parent = document.getElementById(parent) || document.body;
    }
    parent.appendChild(canvas);

    prism.canvas = canvas;
    prism.ctx = canvas.getContext("2d", { alpha: false });
    prism.width = w;
    prism.height = h;
    prism.background = bg;
    prism._mode = mode;
    prism._quality = quality;

    prism._applyMode();
    prism._applyQuality();
    prism._resize();

    window.addEventListener("resize", prism._resize);

    prism._setupInput();

    return prism;
  };

  prism._applyMode = function () {
    var ctx = prism.ctx;
    if (!ctx) return;
    if (prism._mode === "pixel") {
      ctx.imageSmoothingEnabled = false;
      if ("webkitImageSmoothingEnabled" in ctx) ctx.webkitImageSmoothingEnabled = false;
      if ("mozImageSmoothingEnabled" in ctx) ctx.mozImageSmoothingEnabled = false;
      prism.canvas.style.imageRendering = "pixelated";
      prism._dpr = 1;
      prism._pixelSnap = true;
    } else {
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
      prism.canvas.style.imageRendering = "auto";
      prism._dpr = window.devicePixelRatio || 1;
      prism._pixelSnap = false;
    }
  };

  prism._applyQuality = function () {
    var ctx = prism.ctx;
    if (!ctx) return;

    if (prism._quality === "master") {
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
      prism._dpr = window.devicePixelRatio || 1;
      prism._pixelSnap = false;
      prism.canvas.style.imageRendering = "auto";

      if (prism._mode === "pixel") {
        ctx.imageSmoothingEnabled = false;
        if ("webkitImageSmoothingEnabled" in ctx) ctx.webkitImageSmoothingEnabled = false;
        if ("mozImageSmoothingEnabled" in ctx) ctx.mozImageSmoothingEnabled = false;
        prism.canvas.style.imageRendering = "pixelated";
      }
    } else {
      if (prism._mode === "pixel") {
        prism._dpr = 1;
        prism._pixelSnap = true;
      }
    }
  };

  prism._resize = function () {
    var canvas = prism.canvas;
    if (!canvas) return;

    var parent = canvas.parentElement || document.body;
    var availW = parent.clientWidth || window.innerWidth;
    var availH = parent.clientHeight || window.innerHeight;
    var cssW, cssH;

    if (prism._scaleMode === "fit") {
      var ratio = prism.width / prism.height;
      var availRatio = availW / availH;
      if (availRatio > ratio) {
        cssH = availH;
        cssW = availH * ratio;
      } else {
        cssW = availW;
        cssH = availW / ratio;
      }
      if (prism._mode === "pixel" && prism._quality === "canvas") {
        var s = Math.max(1, Math.floor(Math.min(cssW / prism.width, cssH / prism.height)));
        cssW = prism.width * s;
        cssH = prism.height * s;
      }
    } else if (prism._scaleMode === "fill" || prism._scaleMode === "stretch") {
      cssW = availW;
      cssH = availH;
    } else {
      cssW = prism.width;
      cssH = prism.height;
    }

    prism._cssWidth = cssW;
    prism._cssHeight = cssH;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    var dpr = (prism._quality === "master") ? prism._dpr : 1;
    canvas.width = Math.round(prism.width * dpr);
    canvas.height = Math.round(prism.height * dpr);
    prism.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    prism._applyMode();
    prism._applyQuality();
    prism._emit("resize", { w: cssW, h: cssH });
  };

  prism.bg = function (color) {
    prism.background = color;
    if (prism.canvas) prism.canvas.style.background = color;
    return prism;
  };

  prism.size = function (w, h) {
    prism.width = w;
    prism.height = h;
    prism._resize();
    return prism;
  };

  prism.mode = function (m) {
    prism._mode = m;
    prism._applyMode();
    prism._applyQuality();
    prism._resize();
    return prism;
  };

  prism.quality = function (q) {
    prism._quality = q;
    prism._applyMode();
    prism._applyQuality();
    prism._resize();
    return prism;
  };

  prism.scaleMode = function (s) {
    prism._scaleMode = s;
    prism._resize();
    return prism;
  };

  prism.smooth = function (enabled) {
    prism.ctx.imageSmoothingEnabled = enabled;
    return prism;
  };

  prism.interpolate = function (enabled) {
    prism._interpolate = enabled;
    return prism;
  };

  prism.clear = function (color) {
    prism.ctx.fillStyle = color || prism.background;
    prism.ctx.fillRect(0, 0, prism.width, prism.height);
    return prism;
  };

  prism.alpha = function (a) {
    prism.ctx.globalAlpha = (a === undefined) ? 1 : a;
    return prism;
  };

  prism.on = function (event, fn) {
    if (!prism._hooks[event]) prism._hooks[event] = [];
    prism._hooks[event].push(fn);
    return prism;
  };

  prism.off = function (event, fn) {
    if (!prism._hooks[event]) return prism;
    var i = prism._hooks[event].indexOf(fn);
    if (i > -1) prism._hooks[event].splice(i, 1);
    return prism;
  };

  prism._emit = function (event, arg) {
    var list = prism._hooks[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) list[i](arg);
  };

  prism.rand = function (min, max) {
    if (max === undefined) { max = min; min = 0; }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  prism.randf = function (min, max) { return Math.random() * (max - min) + min; };

  prism.clamp = function (v, min, max) { return v < min ? min : (v > max ? max : v); };

  prism.dist = function (x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  prism.angle = function (x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  };

  prism.lerp = function (a, b, t) { return a + (b - a) * t; };

  prism.snap = function (v) {
    return prism._pixelSnap ? Math.round(v) : v;
  };

  prism.gravity = function (x, y) {
    prism._gravity.x = x;
    prism._gravity.y = y;
    return prism;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism._tickTimers = function (dt) {
    for (var i = prism._timers.length - 1; i >= 0; i--) {
      var t = prism._timers[i];
      t.time -= dt;
      if (t.time <= 0) {
        t.fn();
        prism._timers.splice(i, 1);
      }
    }
  };

  prism.wait = function (seconds, fn) {
    prism._timers.push({ time: seconds, fn: fn });
    return prism;
  };

  prism.loop = function (config) {
    config = config || {};
    if (config.update) prism.on("update", config.update);
    if (config.draw) prism.on("draw", config.draw);
    if (config.background) prism.bg(config.background);
    if (config.autoClear !== undefined) prism.autoClear = config.autoClear;
    if (config.init) config.init();

    prism._running = true;
    prism._lastTime = performance.now();
    prism._accumulator = 0;

    function frame(now) {
      if (!prism._running) return;

      var delta = now - prism._lastTime;
      if (delta > 200) delta = 200;
      prism._lastTime = now;
      prism._accumulator += delta;

      prism._syncInput();

      while (prism._accumulator >= prism._timestep) {
        var dt = prism._timestep / 1000;

        prism._applyGravity(dt);
        prism._moveBodies(dt);
        prism._tickTimers(dt);
        prism._updateParticles(dt);

        prism._emit("update", dt);

        if (prism._currentScene && prism._currentScene._emit) {
          prism._currentScene._emit("update", dt);
        }

        if (prism._activeCamera) {
          prism.updateCamera(prism._activeCamera, dt);
        }

        prism._accumulator -= prism._timestep;
      }

      prism._alpha = prism._interpolate ? (prism._accumulator / prism._timestep) : 1;

      if (prism.autoClear) prism.clear();

      prism._emit("draw");

      if (prism._currentScene && prism._currentScene._emit) {
        prism._currentScene._emit("draw");
      }

      prism._clearFrameInput();

      prism._rafId = requestAnimationFrame(frame);
    }

    prism._rafId = requestAnimationFrame(frame);
    return prism;
  };

  prism.stop = function () {
    prism._running = false;
    if (prism._rafId) cancelAnimationFrame(prism._rafId);
    return prism;
  };

})(typeof window !== "undefined" ? window : this);
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
(function (global) {

  var prism = global.prism;

  prism.fill = function (color) { prism.ctx.fillStyle = color; return prism; };
  prism.stroke = function (color, width) {
    prism.ctx.strokeStyle = color;
    prism.ctx.lineWidth = width || 1;
    return prism;
  };

  prism.shadow = function (color, blur, ox, oy) {
    var ctx = prism.ctx;
    ctx.shadowColor = color || "transparent";
    ctx.shadowBlur = blur || 0;
    ctx.shadowOffsetX = ox || 0;
    ctx.shadowOffsetY = oy || 0;
    return prism;
  };

  prism.noShadow = function () {
    var ctx = prism.ctx;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return prism;
  };

  prism.blend = function (mode) {
    prism.ctx.globalCompositeOperation = mode || "source-over";
    return prism;
  };

  prism.drawRect = function (x, y, w, h, color) {
    if (color) prism.ctx.fillStyle = color;
    prism.ctx.fillRect(prism.snap(x), prism.snap(y), w, h);
    return prism;
  };

  prism.drawRectLine = function (x, y, w, h, color, lw) {
    if (color) prism.ctx.strokeStyle = color;
    prism.ctx.lineWidth = lw || 1;
    prism.ctx.strokeRect(prism.snap(x), prism.snap(y), w, h);
    return prism;
  };

  prism.drawRound = function (x, y, w, h, r, color) {
    var ctx = prism.ctx;
    r = r || 5;
    if (color) ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    return prism;
  };

  prism.drawCircle = function (x, y, r, color) {
    if (color) prism.ctx.fillStyle = color;
    prism.ctx.beginPath();
    prism.ctx.arc(prism.snap(x), prism.snap(y), r, 0, Math.PI * 2);
    prism.ctx.fill();
    return prism;
  };

  prism.drawCircleLine = function (x, y, r, color, lw) {
    if (color) prism.ctx.strokeStyle = color;
    prism.ctx.lineWidth = lw || 1;
    prism.ctx.beginPath();
    prism.ctx.arc(prism.snap(x), prism.snap(y), r, 0, Math.PI * 2);
    prism.ctx.stroke();
    return prism;
  };

  prism.drawArc = function (x, y, r, startAngle, endAngle, color, lw) {
    if (color) prism.ctx.strokeStyle = color;
    prism.ctx.lineWidth = lw || 1;
    prism.ctx.beginPath();
    prism.ctx.arc(x, y, r, startAngle, endAngle);
    prism.ctx.stroke();
    return prism;
  };

  prism.drawLine = function (x1, y1, x2, y2, color, lw) {
    if (color) prism.ctx.strokeStyle = color;
    prism.ctx.lineWidth = lw || 1;
    prism.ctx.beginPath();
    prism.ctx.moveTo(x1, y1);
    prism.ctx.lineTo(x2, y2);
    prism.ctx.stroke();
    return prism;
  };

  prism.drawTri = function (x1, y1, x2, y2, x3, y3, color) {
    if (color) prism.ctx.fillStyle = color;
    prism.ctx.beginPath();
    prism.ctx.moveTo(x1, y1);
    prism.ctx.lineTo(x2, y2);
    prism.ctx.lineTo(x3, y3);
    prism.ctx.closePath();
    prism.ctx.fill();
    return prism;
  };

  prism.drawPoly = function (points, color) {
    if (!points || points.length < 2) return prism;
    if (color) prism.ctx.fillStyle = color;
    prism.ctx.beginPath();
    prism.ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) prism.ctx.lineTo(points[i].x, points[i].y);
    prism.ctx.closePath();
    prism.ctx.fill();
    return prism;
  };

  prism.drawGradRect = function (x, y, w, h, color1, color2, vertical) {
    var ctx = prism.ctx;
    var grad;
    if (vertical) grad = ctx.createLinearGradient(x, y, x, y + h);
    else grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(prism.snap(x), prism.snap(y), w, h);
    return prism;
  };

  prism.drawText = function (text, x, y, opts) {
    var o = opts || {};
    var ctx = prism.ctx;
    ctx.font = (o.italic ? "italic " : "") + (o.bold ? "bold " : "") + (o.size || 16) + "px " + (o.font || "Arial");
    ctx.fillStyle = o.color || "#fff";
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.baseline || "top";

    if (o.outline) {
      ctx.strokeStyle = o.outlineColor || "#000";
      ctx.lineWidth = o.outlineWidth || 2;
      ctx.lineJoin = "round";
      ctx.strokeText(text, prism.snap(x), prism.snap(y));
    }

    ctx.fillText(text, prism.snap(x), prism.snap(y));
    return prism;
  };

  prism.measureText = function (text, size, font) {
    var ctx = prism.ctx;
    ctx.font = (size || 16) + "px " + (font || "Arial");
    return ctx.measureText(text).width;
  };

  prism.push = function () { prism.ctx.save(); return prism; };
  prism.pop = function () { prism.ctx.restore(); return prism; };
  prism.translate = function (x, y) { prism.ctx.translate(x, y); return prism; };
  prism.rotate = function (r) { prism.ctx.rotate(r); return prism; };
  prism.scale = function (x, y) { prism.ctx.scale(x, y === undefined ? x : y); return prism; };

  var _pidCounter = 1;
  prism._nextPid = function () { return _pidCounter++; };

  prism._registerGroup = function (obj) {
    if (!obj.tag) return;
    if (!prism._groups[obj.tag]) prism._groups[obj.tag] = [];
    var g = prism._groups[obj.tag];
    if (g.indexOf(obj) === -1) g.push(obj);
  };

  function makeShape(type, config) {
    var defaults = {
      type: type,
      x: 0, y: 0, w: 32, h: 32,
      vx: 0, vy: 0,
      _color: "#fff",
      visible: true,
      solid: true,
      gravity: false,
      gravityScale: 1,
      friction: 0,
      bounce: 0,
      maxVX: undefined,
      maxVY: undefined,
      frozen: false,
      oneWay: false,
      sensor: false,
      tag: "",
      data: {},
      grounded: false,
      wasGrounded: false,
      coyote: 0,
      jumpBuffer: 0,
      angle: 0,
      _sx: 1, _sy: 1,
      _flipX: false, _flipY: false,
      _prevX: 0, _prevY: 0,
      _isBody: false,
      _pid: 0,
      _handlers: {},
      _autoSize: false
    };

    var obj = {};
    var k;
    for (k in defaults) obj[k] = defaults[k];
    if (config) { for (k in config) obj[k] = config[k]; }

    obj._prevX = obj.x;
    obj._prevY = obj.y;

    obj.color = function (c) { obj._color = c; return obj; };

    obj.at = function (x, y) {
      obj.x = x; obj.y = y;
      obj._prevX = x; obj._prevY = y;
      return obj;
    };

    obj.size = function (w, h) {
      obj.w = w; obj.h = h;
      if (obj.type === "sprite" && !obj.animated) {
        obj.frameW = w; obj.frameH = h;
      }
      obj._autoSize = false;
      return obj;
    };

    obj.tagged = function (t) {
      obj.tag = t;
      if (!obj._pid) obj._pid = prism._nextPid();
      prism._registerGroup(obj);
      return obj;
    };

    obj.hide = function () { obj.visible = false; return obj; };
    obj.show = function () { obj.visible = true; return obj; };
    obj.rot = function (a) { obj.angle = a; return obj; };
    obj.flip = function (fx, fy) { obj._flipX = !!fx; obj._flipY = !!fy; return obj; };
    obj.scaleXY = function (sx, sy) { obj._sx = sx; obj._sy = (sy === undefined ? sx : sy); return obj; };

    obj.body = function () {
      obj.gravity = true; obj._isBody = true;
      prism.addBody(obj);
      return obj;
    };

    obj.kinematic = function () {
      obj.gravity = false; obj._isBody = true;
      prism.addBody(obj);
      return obj;
    };

    obj.gscale = function (g) { obj.gravityScale = g; return obj; };
    obj.fric = function (f) { obj.friction = f; return obj; };
    obj.bouncy = function (b) { obj.bounce = b; return obj; };
    obj.maxSpeed = function (mx, my) {
      obj.maxVX = mx;
      obj.maxVY = (my === undefined ? mx : my);
      return obj;
    };

    obj.oneWayPlatform = function () { obj.oneWay = true; return obj; };
    obj.trigger = function () { obj.sensor = true; return obj; };
    obj.freeze = function () { obj.frozen = true; return obj; };
    obj.unfreeze = function () { obj.frozen = false; return obj; };

    obj.vel = function (vx, vy) {
      if (vx !== undefined && vx !== null) obj.vx = vx;
      if (vy !== undefined && vy !== null) obj.vy = vy;
      return obj;
    };

    obj.velX = function (vx) { obj.vx = vx; return obj; };
    obj.velY = function (vy) { obj.vy = vy; return obj; };

    obj.move = function (dx, dy) {
      obj.x += dx;
      obj.y += (dy === undefined ? 0 : dy);
      return obj;
    };

    obj.moveX = function (dx) { obj.x += dx; return obj; };
    obj.moveY = function (dy) { obj.y += dy; return obj; };

    obj.moveAxis = function (ix, iy, speed) {
      var len = Math.sqrt(ix * ix + iy * iy);
      if (len > 0) { ix /= len; iy /= len; }
      obj.vx = ix * speed; obj.vy = iy * speed;
      return obj;
    };

    obj.moveDir = function (a, speed) {
      obj.vx = Math.cos(a) * speed;
      obj.vy = Math.sin(a) * speed;
      return obj;
    };

    obj.moveToward = function (tx, ty, speed) {
      var dx = tx - obj.x, dy = ty - obj.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < speed || d === 0) { obj.x = tx; obj.y = ty; return true; }
      obj.x += (dx / d) * speed;
      obj.y += (dy / d) * speed;
      return false;
    };

    obj.chase = function (target, speed) {
      var cx = obj.x + obj.w * 0.5;
      var cy = obj.y + obj.h * 0.5;
      var tx = target.x + (target.w || 0) * 0.5;
      var ty = target.y + (target.h || 0) * 0.5;
      var dx = tx - cx, dy = ty - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      obj.vx = (dx / d) * speed; obj.vy = (dy / d) * speed;
      return obj;
    };

    obj.addForce = function (fx, fy) {
      obj.vx += fx;
      obj.vy += (fy === undefined ? 0 : fy);
      return obj;
    };

    obj.impulse = function (fx, fy) {
      obj.vx = fx;
      obj.vy = (fy === undefined ? obj.vy : fy);
      return obj;
    };

    obj.jump = function (force, requireGround) {
      if (requireGround !== false) {
        if (!obj.grounded && !(obj.coyote > 0)) return false;
      }
      obj.vy = -Math.abs(force);
      obj.grounded = false; obj.coyote = 0; obj.jumpBuffer = 0;
      return true;
    };

    obj.jumpTo = function (fx, fy) {
      obj.vx = fx; obj.vy = fy; obj.grounded = false;
      return obj;
    };

    obj.dash = function (dx, dy, speed) {
      var len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) { dx /= len; dy /= len; }
      obj.vx = dx * speed; obj.vy = dy * speed;
      return obj;
    };

    obj.stop = function () { obj.vx = 0; obj.vy = 0; return obj; };
    obj.stopX = function () { obj.vx = 0; return obj; };
    obj.stopY = function () { obj.vy = 0; return obj; };

    obj.lookAt = function (tx, ty) {
      var cx = obj.x + obj.w * 0.5;
      var cy = obj.y + obj.h * 0.5;
      obj.angle = Math.atan2(ty - cy, tx - cx);
      return obj;
    };

    obj.centerX = function () { return obj.x + obj.w * 0.5; };
    obj.centerY = function () { return obj.y + obj.h * 0.5; };

    obj.setCenter = function (cx, cy) {
      obj.x = cx - obj.w * 0.5; obj.y = cy - obj.h * 0.5;
      obj._prevX = obj.x; obj._prevY = obj.y;
      return obj;
    };

    obj.left = function () { return obj.x; };
    obj.right = function () { return obj.x + obj.w; };
    obj.top = function () { return obj.y; };
    obj.bottom = function () { return obj.y + obj.h; };

    obj.hits = function (other) { return prism.collide(obj, other); };
    obj.overlaps = function (other) { return prism.overlap(obj, other); };
    obj.solveWith = function (other, opts) { return prism.solve(obj, other, opts); };
    obj.solveGroup = function (tag, opts) { return prism._solveGroup(obj, tag, opts); };

    obj.onHit = function (tag, fn) {
      if (!obj._handlers.hit) obj._handlers.hit = [];
      obj._handlers.hit.push({ tag: tag, fn: fn });
      return obj;
    };
    obj.onEnter = function (tag, fn) {
      if (!obj._handlers.enter) obj._handlers.enter = [];
      obj._handlers.enter.push({ tag: tag, fn: fn });
      return obj;
    };
    obj.onLeave = function (tag, fn) {
      if (!obj._handlers.leave) obj._handlers.leave = [];
      obj._handlers.leave.push({ tag: tag, fn: fn });
      return obj;
    };
    obj.onStay = function (tag, fn) {
      if (!obj._handlers.stay) obj._handlers.stay = [];
      obj._handlers.stay.push({ tag: tag, fn: fn });
      return obj;
    };

    function fireHandlers(kind, tag, other) {
      var list = obj._handlers[kind];
      if (!list) return;
      for (var i = 0; i < list.length; i++) {
        if (list[i].tag === tag) list[i].fn(other);
      }
    }

    obj.check = function () {
      var kinds = ["enter", "leave", "stay", "hit"];
      var tags = {};
      for (var h = 0; h < kinds.length; h++) {
        var arr = obj._handlers[kinds[h]];
        if (!arr) continue;
        for (var a = 0; a < arr.length; a++) tags[arr[a].tag] = true;
      }
      var tagKeys = Object.keys(tags);
      for (var t = 0; t < tagKeys.length; t++) {
        (function (tag) {
          prism._checkGroup(obj, tag, {
            enter: function (other) {
              fireHandlers("enter", tag, other);
              fireHandlers("hit", tag, other);
            },
            stay: function (other) { fireHandlers("stay", tag, other); },
            leave: function (other) { fireHandlers("leave", tag, other); }
          });
        })(tagKeys[t]);
      }
      return obj;
    };

    obj.ray = function (dx, dy, tag, maxDist) {
      return prism.rayHitsGroup(obj.centerX(), obj.centerY(), dx, dy, tag, maxDist);
    };

    obj.draw = function () { prism.render(obj); return obj; };

    obj.kill = function () {
      obj.visible = false;
      prism.removeBody(obj);
      return obj;
    };

    return obj;
  }

  prism._makeShape = makeShape;

  prism.rect = function (x, y, w, h) {
    return makeShape("rect", { x: x || 0, y: y || 0, w: w || 32, h: h || 32 });
  };

  prism.circle = function (x, y, r) {
    r = r || 16;
    return makeShape("circle", { x: x || 0, y: y || 0, radius: r, w: r * 2, h: r * 2 });
  };

  function renderX(obj) {
    if (!obj._isBody || !prism._interpolate) return obj.x;
    return obj._prevX + (obj.x - obj._prevX) * prism._alpha;
  }

  function renderY(obj) {
    if (!obj._isBody || !prism._interpolate) return obj.y;
    return obj._prevY + (obj.y - obj._prevY) * prism._alpha;
  }

  function posSnap(v) {
    if (prism._activeCamera) return v;
    return prism.snap(v);
  }

  prism.render = function (obj) {
    if (!obj || !obj.visible) return prism;

    var px = renderX(obj);
    var py = renderY(obj);
    var hasTransform = obj.angle || obj._flipX || obj._flipY || obj._sx !== 1 || obj._sy !== 1;

    if (obj.type === "sprite") {
      var img = (typeof obj.image === "object" && obj.image !== null) ? obj.image : prism._images[obj.image];
      if (!img) return prism;
      var nw = img.naturalWidth || img.width || 0;
      var nh = img.naturalHeight || img.height || 0;
      if (!nw || !nh) return prism;

      if (obj._autoSize && !obj.animated) {
        obj.w = nw; obj.h = nh;
        obj.frameW = nw; obj.frameH = nh;
        obj._autoSize = false;
      }

      var fw = obj.animated ? (obj.frameW || obj.w) : nw;
      var fh = obj.animated ? (obj.frameH || obj.h) : nh;
      var fx = obj.animated ? ((obj._currentFrame || 0) * fw) : 0;
      var fy = obj.animated ? ((obj.frameY || 0) * fh) : 0;
      var dw = obj.w || fw;
      var dh = obj.h || fh;

      if (hasTransform) {
        var ctx = prism.ctx;
        ctx.save();
        ctx.translate(posSnap(px + dw * 0.5), posSnap(py + dh * 0.5));
        if (obj.angle) ctx.rotate(obj.angle);
        ctx.scale(obj._sx * (obj._flipX ? -1 : 1), obj._sy * (obj._flipY ? -1 : 1));
        ctx.translate(-dw * 0.5, -dh * 0.5);
        ctx.drawImage(img, fx, fy, fw, fh, 0, 0, dw, dh);
        ctx.restore();
        return prism;
      }

      prism.ctx.drawImage(img, fx, fy, fw, fh, posSnap(px), posSnap(py), dw, dh);
      return prism;
    }

    if (hasTransform) {
      var ctx2 = prism.ctx;
      ctx2.save();
      ctx2.translate(posSnap(px + obj.w * 0.5), posSnap(py + obj.h * 0.5));
      if (obj.angle) ctx2.rotate(obj.angle);
      ctx2.scale(obj._sx * (obj._flipX ? -1 : 1), obj._sy * (obj._flipY ? -1 : 1));
      ctx2.translate(-obj.w * 0.5, -obj.h * 0.5);

      if (obj.type === "rect") {
        ctx2.fillStyle = obj._color;
        ctx2.fillRect(0, 0, obj.w, obj.h);
      } else if (obj.type === "circle") {
        ctx2.fillStyle = obj._color;
        ctx2.beginPath();
        ctx2.arc(obj.radius, obj.radius, obj.radius, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.restore();
      return prism;
    }

    var sx = posSnap(px);
    var sy = posSnap(py);

    if (obj.type === "rect") {
      prism.ctx.fillStyle = obj._color;
      prism.ctx.fillRect(sx, sy, obj.w, obj.h);
    } else if (obj.type === "circle") {
      prism.ctx.fillStyle = obj._color;
      prism.ctx.beginPath();
      prism.ctx.arc(sx + obj.radius, sy + obj.radius, obj.radius, 0, Math.PI * 2);
      prism.ctx.fill();
    }
    return prism;
  };

  prism.renderX = renderX;
  prism.renderY = renderY;


})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism.load = function (name, src, cb) {
    var img = new Image();
    img.onload = function () { prism._images[name] = img; if (cb) cb(img); };
    img.onerror = function () { console.warn("Prism2D: image failed " + src); if (cb) cb(null); };
    img.src = src;
    return prism;
  };

  prism.loadAll = function (list, done) {
    var keys = Object.keys(list);
    var remaining = keys.length;
    if (remaining === 0) { if (done) done(); return prism; }
    for (var i = 0; i < keys.length; i++) {
      (function (name) {
        prism.load(name, list[name], function () {
          remaining--;
          if (remaining === 0 && done) done();
        });
      })(keys[i]);
    }
    return prism;
  };

  prism.image = function (name) { return prism._images[name] || null; };

  prism.drawImg = function (name, x, y, w, h) {
    var img = (typeof name === "object" && name !== null) ? name : prism._images[name];
    if (!img) return prism;
    var nw = img.naturalWidth || img.width || 0;
    var nh = img.naturalHeight || img.height || 0;
    var dw = (w !== undefined) ? w : nw;
    var dh = (h !== undefined) ? h : nh;
    if (dw > 0 && dh > 0) {
      prism.ctx.drawImage(img, prism.snap(x), prism.snap(y), dw, dh);
    }
    return prism;
  };

  prism.sprite = function (name, x, y) {
    var img = (typeof name === "object" && name !== null) ? name : prism._images[name];
    var hasImg = img && (img.naturalWidth || img.width);
    var w = hasImg ? (img.naturalWidth || img.width) : 32;
    var h = hasImg ? (img.naturalHeight || img.height) : 32;

    var s = prism._makeShape("sprite", {
      image: name,
      x: x || 0, y: y || 0,
      w: w, h: h,
      frameX: 0, frameY: 0,
      frameW: w, frameH: h,
      animated: false,
      frameCount: 1,
      frameSpeed: 8,
      _frameTick: 0,
      _currentFrame: 0,
      _autoSize: !hasImg
    });

    s.anim = function (frameW, frameH, count, speed) {
      s.frameW = frameW; s.frameH = frameH;
      s.frameCount = count;
      s.frameSpeed = speed || 8;
      s.animated = true;
      s.w = frameW; s.h = frameH;
      s._autoSize = false;
      return s;
    };

    s.row = function (r) {
      if (s.frameY !== r) {
        s.frameY = r;
        s._currentFrame = 0;
        s._frameTick = 0;
      }
      return s;
    };

    s.frames = function (count) { s.frameCount = count; return s; };
    s.speed = function (sp) { s.frameSpeed = sp; return s; };

    s.tick = function () {
      if (!s.animated) return s;
      s._frameTick++;
      if (s._frameTick >= s.frameSpeed) {
        s._frameTick = 0;
        s._currentFrame = (s._currentFrame + 1) % s.frameCount;
      }
      return s;
    };

    return s;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  function Emitter(config) {
    var e = {
      x: config.x || 0,
      y: config.y || 0,
      active: true,
      rate: config.rate || 10,
      burst: config.burst || 0,
      maxParticles: config.max || 200,
      _particles: [],
      _timer: 0,
      _burstDone: false,

      minLife: config.minLife || 0.5,
      maxLife: config.maxLife || 2.0,
      minSpeed: config.minSpeed || 20,
      maxSpeed: config.maxSpeed || 100,
      minAngle: config.minAngle || 0,
      maxAngle: config.maxAngle || Math.PI * 2,
      minSize: config.minSize || 2,
      maxSize: config.maxSize || 6,
      endSize: config.endSize !== undefined ? config.endSize : 0,
      colors: config.colors || ["#fff"],
      shape: config.shape || "rect",
      gravity: config.gravity !== undefined ? config.gravity : 0,
      fadeOut: config.fadeOut !== undefined ? config.fadeOut : true,
      spread: config.spread || 0,
      friction: config.friction || 0,

      at: function (x, y) { e.x = x; e.y = y; return e; },

      emit: function (count) {
        count = count || 1;
        for (var i = 0; i < count; i++) {
          if (e._particles.length >= e.maxParticles) break;
          var angle = prism.randf(e.minAngle, e.maxAngle);
          var speed = prism.randf(e.minSpeed, e.maxSpeed);
          var life = prism.randf(e.minLife, e.maxLife);
          var size = prism.randf(e.minSize, e.maxSize);
          var color = e.colors[prism.rand(0, e.colors.length - 1)];
          var ox = e.spread > 0 ? prism.randf(-e.spread, e.spread) : 0;
          var oy = e.spread > 0 ? prism.randf(-e.spread, e.spread) : 0;

          e._particles.push({
            x: e.x + ox, y: e.y + oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: life, maxLife: life,
            size: size, startSize: size,
            endSize: e.endSize,
            color: color, shape: e.shape,
            alpha: 1
          });
        }
        return e;
      },

      explode: function (count) {
        e.emit(count || e.burst || 20);
        return e;
      },

      stop: function () { e.active = false; return e; },
      start: function () { e.active = true; e._burstDone = false; return e; },

      update: function (dt) {
        if (e.active && e.rate > 0 && !e.burst) {
          e._timer += dt;
          var interval = 1 / e.rate;
          while (e._timer >= interval) {
            e.emit(1);
            e._timer -= interval;
          }
        }

        if (e.active && e.burst > 0 && !e._burstDone) {
          e.emit(e.burst);
          e._burstDone = true;
        }

        var particles = e._particles;
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          if (e.friction > 0) {
            p.vx *= (1 - e.friction * dt);
            p.vy *= (1 - e.friction * dt);
          }

          p.vy += e.gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          var t = 1 - (p.life / p.maxLife);
          p.size = p.startSize + (p.endSize - p.startSize) * t;
          if (p.size < 0) p.size = 0;

          if (e.fadeOut) {
            p.alpha = p.life / p.maxLife;
          }
        }
        return e;
      },

      draw: function () {
        var ctx = prism.ctx;
        var particles = e._particles;
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          if (p.size <= 0) continue;
          var prevAlpha = ctx.globalAlpha;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(prism.snap(p.x), prism.snap(p.y), p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            var half = p.size * 0.5;
            ctx.fillRect(prism.snap(p.x - half), prism.snap(p.y - half), p.size, p.size);
          }
          ctx.globalAlpha = prevAlpha;
        }
        return e;
      },

      count: function () { return e._particles.length; },
      clear: function () { e._particles = []; return e; },
      dead: function () { return !e.active && e._particles.length === 0; }
    };
    return e;
  }

  prism.emitter = function (config) {
    var em = Emitter(config || {});
    prism._particles.push(em);
    return em;
  };

  prism._updateParticles = function (dt) {
    for (var i = prism._particles.length - 1; i >= 0; i--) {
      prism._particles[i].update(dt);
    }
  };

  prism.drawParticles = function () {
    for (var i = 0; i < prism._particles.length; i++) {
      prism._particles[i].draw();
    }
    return prism;
  };

  prism.clearParticles = function () {
    prism._particles = [];
    return prism;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism.addBody = function (obj) {
    obj._isBody = true;
    if (prism._bodies.indexOf(obj) === -1) prism._bodies.push(obj);
    return obj;
  };

  prism.removeBody = function (obj) {
    obj._isBody = false;
    var i = prism._bodies.indexOf(obj);
    if (i > -1) prism._bodies.splice(i, 1);
    if (obj.tag && prism._groups[obj.tag]) {
      var g = prism._groups[obj.tag];
      var j = g.indexOf(obj);
      if (j > -1) g.splice(j, 1);
    }
    if (obj._pid) {
      var pidStr = String(obj._pid);
      for (var k in prism._contacts) {
        var parts = k.split("|");
        if (parts[0] === pidStr || parts[1] === pidStr) {
          delete prism._contacts[k];
        }
      }
    }
    return prism;
  };

  prism.clearBodies = function () {
    prism._bodies = [];
    prism._groups = {};
    prism._contacts = {};
    return prism;
  };

  prism.group = function (tag) {
    return prism._groups[tag] || [];
  };

  prism._applyGravity = function (dt) {
    for (var i = 0; i < prism._bodies.length; i++) {
      var b = prism._bodies[i];
      if (b.frozen) continue;
      if (b.gravity) {
        var gm = (b.gravityScale === undefined) ? 1 : b.gravityScale;
        b.vx += prism._gravity.x * gm * dt;
        b.vy += prism._gravity.y * gm * dt;
      }
      if (b.friction) b.vx *= (1 - prism.clamp(b.friction * dt * 60, 0, 1));
      if (b.maxVX !== undefined) b.vx = prism.clamp(b.vx, -b.maxVX, b.maxVX);
      if (b.maxVY !== undefined) b.vy = prism.clamp(b.vy, -b.maxVY, b.maxVY);
    }
  };

  prism._moveBodies = function (dt) {
    for (var i = 0; i < prism._bodies.length; i++) {
      var b = prism._bodies[i];
      if (b.frozen) {
        b._prevX = b.x; b._prevY = b.y;
        continue;
      }
      b._prevX = b.x; b._prevY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.wasGrounded = b.grounded;
      if (b.grounded) b.coyote = 0.1;
      else if (b.coyote > 0) b.coyote -= dt;
      b.grounded = false;
      if (b.jumpBuffer > 0) b.jumpBuffer -= dt;
    }
  };

  function boundsOf(o) {
    if (o.type === "circle") return { x: o.x, y: o.y, w: o.radius * 2, h: o.radius * 2 };
    return { x: o.x, y: o.y, w: o.w || 0, h: o.h || 0 };
  }

  prism._boundsOf = boundsOf;

  prism.collide = function (a, b) {
    if (a.type === "circle" && b.type === "circle") return prism.collideCC(a, b);
    if (a.type === "circle") return prism.collideCR(a, b);
    if (b.type === "circle") return prism.collideCR(b, a);
    var A = boundsOf(a), B = boundsOf(b);
    return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
  };

  prism.collideCC = function (a, b) {
    var dx = (a.x + a.radius) - (b.x + b.radius);
    var dy = (a.y + a.radius) - (b.y + b.radius);
    var rr = a.radius + b.radius;
    return (dx * dx + dy * dy) < (rr * rr);
  };

  prism.collideCR = function (c, r) {
    var cx = c.x + c.radius, cy = c.y + c.radius;
    var rb = boundsOf(r);
    var nx = prism.clamp(cx, rb.x, rb.x + rb.w);
    var ny = prism.clamp(cy, rb.y, rb.y + rb.h);
    var dx = cx - nx, dy = cy - ny;
    return (dx * dx + dy * dy) < (c.radius * c.radius);
  };

  prism.overlap = function (a, b) {
    var A = boundsOf(a), B = boundsOf(b);
    var oX = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
    var oY = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
    if (oX <= 0 || oY <= 0) return null;
    return { x: oX, y: oY, area: oX * oY };
  };

  prism.solve = function (moving, solid, opts) {
    opts = opts || {};
    if (moving.sensor || solid.sensor) return null;

    if (moving.type === "circle" && solid.type === "circle") return prism.solveCC(moving, solid);
    if (moving.type === "circle") return prism.solveCR(moving, solid);

    var A = boundsOf(moving), B = boundsOf(solid);
    var dx = (A.x + A.w * 0.5) - (B.x + B.w * 0.5);
    var dy = (A.y + A.h * 0.5) - (B.y + B.h * 0.5);
    var oX = (A.w * 0.5 + B.w * 0.5) - Math.abs(dx);
    var oY = (A.h * 0.5 + B.h * 0.5) - Math.abs(dy);
    if (oX <= 0 || oY <= 0) return null;

    if (solid.oneWay) {
      var prevBottom = (moving._prevY !== undefined ? moving._prevY : moving.y) + A.h;
      if (prevBottom > solid.y + 8 || moving.vy < 0) return null;
      moving.y = solid.y - A.h;
      moving.vy = 0;
      moving.grounded = true;
      return "bottom";
    }

    var bounce = (opts.bounce !== undefined) ? opts.bounce : (moving.bounce || 0);
    var side;

    if (oX < oY) {
      if (dx > 0) { moving.x += oX; side = "left"; }
      else { moving.x -= oX; side = "right"; }
      moving.vx = -moving.vx * bounce;
    } else {
      if (dy > 0) { moving.y += oY; side = "top"; }
      else { moving.y -= oY; side = "bottom"; moving.grounded = true; }
      moving.vy = -moving.vy * bounce;
    }
    return side;
  };

  prism.solveCC = function (a, b) {
    var dx = (a.x + a.radius) - (b.x + b.radius);
    var dy = (a.y + a.radius) - (b.y + b.radius);
    var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    var o = (a.radius + b.radius) - d;
    if (o <= 0) return null;
    var nx = dx / d, ny = dy / d;
    a.x += nx * o; a.y += ny * o;
    var bounce = a.bounce || 0;
    var dot = a.vx * nx + a.vy * ny;
    a.vx -= (1 + bounce) * dot * nx;
    a.vy -= (1 + bounce) * dot * ny;
    if (ny < -0.5) a.grounded = true;
    return { nx: nx, ny: ny };
  };

  prism.solveCR = function (c, r) {
    var cx = c.x + c.radius, cy = c.y + c.radius;
    var rb = boundsOf(r);
    var nx = prism.clamp(cx, rb.x, rb.x + rb.w);
    var ny = prism.clamp(cy, rb.y, rb.y + rb.h);
    var dx = cx - nx, dy = cy - ny;
    var d2 = dx * dx + dy * dy;

    if (dx === 0 && dy === 0) {
      var dl = cx - rb.x;
      var dr = (rb.x + rb.w) - cx;
      var dtt = cy - rb.y;
      var db = (rb.y + rb.h) - cy;
      var min = Math.min(dl, dr, dtt, db);
      if (min === dl) dx = -c.radius;
      else if (min === dr) dx = c.radius;
      else if (min === dtt) dy = -c.radius;
      else dy = c.radius;
      d2 = dx * dx + dy * dy;
    }

    if (d2 >= c.radius * c.radius) return null;
    var d = Math.sqrt(d2) || 0.0001;
    var o = c.radius - d;
    var nX = dx / d, nY = dy / d;
    c.x += nX * o; c.y += nY * o;
    var bounce = c.bounce || 0;
    var dot = c.vx * nX + c.vy * nY;
    c.vx -= (1 + bounce) * dot * nX;
    c.vy -= (1 + bounce) * dot * nY;
    if (nY < -0.5) c.grounded = true;
    return { nx: nX, ny: nY };
  };

  prism.sweptAABB = function (a, vx, vy, b) {
    var A = boundsOf(a), B = boundsOf(b);
    var xInvEntry, yInvEntry, xInvExit, yInvExit;
    if (vx > 0) { xInvEntry = B.x - (A.x + A.w); xInvExit = (B.x + B.w) - A.x; }
    else { xInvEntry = (B.x + B.w) - A.x; xInvExit = B.x - (A.x + A.w); }
    if (vy > 0) { yInvEntry = B.y - (A.y + A.h); yInvExit = (B.y + B.h) - A.y; }
    else { yInvEntry = (B.y + B.h) - A.y; yInvExit = B.y - (A.y + A.h); }

    var xEntry, yEntry, xExit, yExit;
    var xOverlap = A.x < B.x + B.w && A.x + A.w > B.x;
    if (vx === 0) {
      xEntry = xOverlap ? -Infinity : Infinity;
      xExit = xOverlap ? Infinity : -Infinity;
    } else {
      xEntry = xInvEntry / vx; xExit = xInvExit / vx;
    }

    var yOverlap = A.y < B.y + B.h && A.y + A.h > B.y;
    if (vy === 0) {
      yEntry = yOverlap ? -Infinity : Infinity;
      yExit = yOverlap ? Infinity : -Infinity;
    } else {
      yEntry = yInvEntry / vy; yExit = yInvExit / vy;
    }

    var entryTime = Math.max(xEntry, yEntry);
    var exitTime = Math.min(xExit, yExit);
    if (entryTime > exitTime || (xEntry < 0 && yEntry < 0) || xEntry > 1 || yEntry > 1) {
      return { time: 1, nx: 0, ny: 0 };
    }
    var rnx = 0, rny = 0;
    if (xEntry > yEntry) rnx = (xInvEntry < 0) ? 1 : -1;
    else rny = (yInvEntry < 0) ? 1 : -1;
    return { time: entryTime, nx: rnx, ny: rny };
  };

  prism.solveSwept = function (moving, solids, dt) {
    if (!Array.isArray(solids)) solids = [solids];
    var rx = moving.vx * dt, ry = moving.vy * dt;
    var remaining = 1;
    var iterations = 0;
    while (remaining > 0 && iterations < 4) {
      var nearest = { time: 1, nx: 0, ny: 0, target: null };
      for (var i = 0; i < solids.length; i++) {
        if (solids[i] === moving) continue;
        var hit = prism.sweptAABB(moving, rx, ry, solids[i]);
        if (hit.time < nearest.time) {
          nearest = { time: hit.time, nx: hit.nx, ny: hit.ny, target: solids[i] };
        }
      }
      moving.x += rx * nearest.time;
      moving.y += ry * nearest.time;
      if (nearest.target) {
        var dot = (moving.vx * nearest.ny + moving.vy * nearest.nx);
        moving.vx = dot * nearest.ny;
        moving.vy = dot * nearest.nx;
        rx = moving.vx * dt * (1 - nearest.time);
        ry = moving.vy * dt * (1 - nearest.time);
        if (nearest.ny < 0) moving.grounded = true;
      }
      remaining -= nearest.time;
      iterations++;
      if (nearest.time >= 1) break;
    }
  };

  prism.raycast = function (x, y, dx, dy, targets, maxDist) {
    maxDist = maxDist || Infinity;
    var closest = null;
    var closestT = maxDist;
    var invDx = 1 / (dx === 0 ? 0.000001 : dx);
    var invDy = 1 / (dy === 0 ? 0.000001 : dy);
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      var b = boundsOf(t);
      var tx1 = (b.x - x) * invDx;
      var tx2 = (b.x + b.w - x) * invDx;
      var ty1 = (b.y - y) * invDy;
      var ty2 = (b.y + b.h - y) * invDy;
      var tmin = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2));
      var tmax = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2));
      if (tmax < 0 || tmin > tmax) continue;
      if (tmin < 0) tmin = 0;
      if (tmin < closestT) {
        closestT = tmin;
        closest = { target: t, dist: tmin, x: x + dx * tmin, y: y + dy * tmin };
      }
    }
    return closest;
  };

  prism.rayHitsGroup = function (x, y, dx, dy, tag, maxDist) {
    return prism.raycast(x, y, dx, dy, prism.group(tag), maxDist);
  };

  prism.inRect = function (px, py, obj) {
    var b = boundsOf(obj);
    return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
  };

  prism.inCircle = function (px, py, obj) {
    var dx = px - (obj.x + obj.radius);
    var dy = py - (obj.y + obj.radius);
    return (dx * dx + dy * dy) < obj.radius * obj.radius;
  };

  prism.moveTo = function (obj, x, y) {
    obj.x = x; obj.y = y;
    obj._prevX = x; obj._prevY = y;
    return obj;
  };

  prism.moveToward = function (obj, tx, ty, speed) {
    var dx = tx - obj.x, dy = ty - obj.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < speed || d === 0) { obj.x = tx; obj.y = ty; return true; }
    obj.x += (dx / d) * speed;
    obj.y += (dy / d) * speed;
    return false;
  };

  prism._pairKey = function (a, b) {
    return (a._pid < b._pid) ? (a._pid + "|" + b._pid) : (b._pid + "|" + a._pid);
  };

  prism._checkGroup = function (obj, tag, handlers) {
    handlers = handlers || {};
    var list = prism.group(tag);
    if (!obj._pid) obj._pid = prism._nextPid();
    for (var i = 0; i < list.length; i++) {
      var other = list[i];
      if (other === obj) continue;
      if (!other._pid) other._pid = prism._nextPid();
      var key = prism._pairKey(obj, other);
      var was = prism._contacts[key] === true;
      var now = prism.collide(obj, other);
      if (now && !was) {
        prism._contacts[key] = true;
        if (handlers.enter) handlers.enter(other);
      } else if (now && was) {
        if (handlers.stay) handlers.stay(other);
      } else if (!now && was) {
        delete prism._contacts[key];
        if (handlers.leave) handlers.leave(other);
      }
    }
    return obj;
  };

  prism._solveGroup = function (obj, tag, opts) {
    var list = prism.group(tag);
    var sides = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s === obj || s.sensor) continue;
      if (prism.collide(obj, s)) {
        var side = prism.solve(obj, s, opts);
        if (side) sides.push({ side: side, target: s });
      }
    }
    return sides.length ? sides : null;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism.tilemap = function (image, tileW, tileH) {
    var map = {
      image: image || "",
      x: 0, y: 0,
      tileWidth: tileW || 32,
      tileHeight: tileH || 32,
      cols: 0, rows: 0,
      tilesetCols: 1,
      data: [],
      collisionTiles: [],
      solidTile: -1,
      visible: true,
      tag: "",

      at: function (x, y) { map.x = x; map.y = y; return map; },
      grid: function (data) {
        map.data = data;
        map.rows = data.length;
        map.cols = (data[0] && data[0].length) ? data[0].length : 0;
        return map;
      },
      tileset: function (cols) { map.tilesetCols = cols; return map; },
      solids: function (arr) { map.collisionTiles = arr; return map; },
      get: function (c, r) { return prism.getTile(map, c, r); },
      set: function (c, r, v) { prism.setTile(map, c, r, v); return map; },
      draw: function (cam) { prism.drawTilemap(map, cam === undefined ? prism._activeCamera : cam); return map; },
      hits: function (obj) { return prism.collideTilemap(obj, map); },
      solve: function (obj) { return prism.solveTilemap(obj, map); },
      ray: function (x, y, dx, dy, maxDist) { return prism.tilemapRay(map, x, y, dx, dy, maxDist); },
      worldWidth: function () { return map.cols * map.tileWidth; },
      worldHeight: function () { return map.rows * map.tileHeight; }
    };
    return map;
  };

  prism.getTile = function (map, c, r) {
    if (r < 0 || r >= map.rows || c < 0 || c >= map.cols) return -1;
    var row = map.data[r];
    if (!row) return -1;
    var v = row[c];
    if (v === undefined || v === null) return -1;
    return v;
  };

  prism.setTile = function (map, c, r, v) {
    if (r < 0 || r >= map.rows || c < 0 || c >= map.cols) return;
    if (!map.data[r]) return;
    map.data[r][c] = v;
  };

  prism.tileAt = function (map, wx, wy) {
    var c = Math.floor((wx - map.x) / map.tileWidth);
    var r = Math.floor((wy - map.y) / map.tileHeight);
    return { col: c, row: r, value: prism.getTile(map, c, r) };
  };

  prism.isSolid = function (map, v) {
    if (v === -1 || v === undefined || v === null) return false;
    if (map.collisionTiles && map.collisionTiles.length > 0) {
      for (var i = 0; i < map.collisionTiles.length; i++) {
        if (map.collisionTiles[i] === v) return true;
      }
      return false;
    }
    return v > map.solidTile;
  };

  prism.drawTilemap = function (map, cam) {
    if (!map || !map.visible) return;
    var img = (typeof map.image === "object" && map.image !== null) ? map.image : prism._images[map.image];
    if (!img) return;

    var ctx = prism.ctx;
    var tw = map.tileWidth, th = map.tileHeight;
    var sc = 0, ec = map.cols, sr = 0, er = map.rows;

    if (cam) {
      var hw = (prism.width * 0.5) / cam.zoom;
      var hh = (prism.height * 0.5) / cam.zoom;
      var cx = cam.x - cam.offsetX / cam.zoom;
      var cy = cam.y - cam.offsetY / cam.zoom;
      sc = Math.floor((cx - hw - map.x) / tw) - 1;
      ec = Math.ceil((cx + hw - map.x) / tw) + 1;
      sr = Math.floor((cy - hh - map.y) / th) - 1;
      er = Math.ceil((cy + hh - map.y) / th) + 1;
      if (sc < 0) sc = 0;
      if (sr < 0) sr = 0;
      if (ec > map.cols) ec = map.cols;
      if (er > map.rows) er = map.rows;
    }

    for (var r = sr; r < er; r++) {
      var row = map.data[r];
      if (!row) continue;
      for (var c = sc; c < ec; c++) {
        var t = row[c];
        if (t === -1 || t === undefined || t === null) continue;
        var sx = (t % map.tilesetCols) * tw;
        var sy = Math.floor(t / map.tilesetCols) * th;
        ctx.drawImage(img, sx, sy, tw, th, prism.snap(map.x + c * tw), prism.snap(map.y + r * th), tw, th);
      }
    }
  };

  prism.collideTilemap = function (obj, map) {
    if (!map) return null;
    var aw = obj.w || 0, ah = obj.h || 0;
    var lc = Math.floor((obj.x - map.x) / map.tileWidth);
    var rc = Math.floor((obj.x + aw - 0.001 - map.x) / map.tileWidth);
    var tr = Math.floor((obj.y - map.y) / map.tileHeight);
    var br = Math.floor((obj.y + ah - 0.001 - map.y) / map.tileHeight);

    var hits = [];
    for (var r = tr; r <= br; r++) {
      for (var c = lc; c <= rc; c++) {
        var t = prism.getTile(map, c, r);
        if (prism.isSolid(map, t)) {
          hits.push({
            col: c, row: r, value: t,
            x: map.x + c * map.tileWidth,
            y: map.y + r * map.tileHeight,
            w: map.tileWidth, h: map.tileHeight
          });
        }
      }
    }
    return hits.length > 0 ? hits : null;
  };

  prism.solveTilemap = function (obj, map) {
    var hits = prism.collideTilemap(obj, map);
    if (!hits) return null;

    hits.sort(function (a, b) {
      var oa = prism.overlap(obj, a);
      var ob = prism.overlap(obj, b);
      return (ob ? ob.area : 0) - (oa ? oa.area : 0);
    });

    var sides = [];
    for (var i = 0; i < hits.length; i++) {
      if (prism.collide(obj, hits[i])) {
        var s = prism.solve(obj, hits[i]);
        if (s) sides.push(s);
      }
    }
    return sides.length > 0 ? sides : null;
  };

  prism.tilemapRay = function (map, x, y, dx, dy, maxDist) {
    maxDist = maxDist || 1000;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    var stepX = dx >= 0 ? 1 : -1;
    var stepY = dy >= 0 ? 1 : -1;
    var tx = Math.floor((x - map.x) / map.tileWidth);
    var ty = Math.floor((y - map.y) / map.tileHeight);
    var absDx = Math.abs(dx) || 0.000001;
    var absDy = Math.abs(dy) || 0.000001;
    var tDeltaX = map.tileWidth / absDx;
    var tDeltaY = map.tileHeight / absDy;
    var nextX = map.x + (tx + (stepX > 0 ? 1 : 0)) * map.tileWidth;
    var nextY = map.y + (ty + (stepY > 0 ? 1 : 0)) * map.tileHeight;
    var tMaxX = Math.abs((nextX - x) / absDx);
    var tMaxY = Math.abs((nextY - y) / absDy);
    var dist = 0;
    var iterations = 0;

    while (dist < maxDist && iterations < 1000) {
      var v = prism.getTile(map, tx, ty);
      if (prism.isSolid(map, v)) {
        return { col: tx, row: ty, value: v, dist: dist, x: x + dx * dist, y: y + dy * dist };
      }
      if (tMaxX < tMaxY) { tx += stepX; dist = tMaxX; tMaxX += tDeltaX; }
      else { ty += stepY; dist = tMaxY; tMaxY += tDeltaY; }
      iterations++;
    }
    return null;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism.camera = function (x, y) {
    var cam = {
      x: x || 0, y: y || 0,
      zoom: 1, rotation: 0,
      target: null,
      lerpX: 1, lerpY: 1,
      followX: true, followY: true,
      offsetX: 0, offsetY: 0,
      targetOffsetX: 0, targetOffsetY: 0,
      shakeAmount: 0, shakeDuration: 0,
      shakeX: 0, shakeY: 0,
      bounds: null,
      deadzoneW: 0, deadzoneH: 0,

      at: function (px, py) { cam.x = px; cam.y = py; return cam; },
      moveBy: function (dx, dy) { cam.x += dx; cam.y += dy; return cam; },
      zoomTo: function (z) { cam.zoom = z; return cam; },
      rotateTo: function (r) { cam.rotation = r; return cam; },

      follow: function (target, lx, ly) {
        cam.target = target;
        if (lx !== undefined) {
          cam.lerpX = lx;
          cam.lerpY = (ly === undefined) ? lx : ly;
        }
        return cam;
      },

      lerp: function (lx, ly) {
        cam.lerpX = lx;
        cam.lerpY = (ly === undefined) ? lx : ly;
        return cam;
      },

      axis: function (fx, fy) {
        cam.followX = !!fx; cam.followY = !!fy;
        return cam;
      },

      lockX: function () { cam.followX = false; return cam; },
      lockY: function () { cam.followY = false; return cam; },
      freeX: function () { cam.followX = true; return cam; },
      freeY: function () { cam.followY = true; return cam; },
      unfollow: function () { cam.target = null; return cam; },

      lead: function (ox, oy) {
        cam.targetOffsetX = ox;
        cam.targetOffsetY = (oy === undefined) ? 0 : oy;
        return cam;
      },

      offset: function (ox, oy) {
        cam.offsetX = ox;
        cam.offsetY = (oy === undefined) ? 0 : oy;
        return cam;
      },

      shake: function (amount, duration) {
        cam.shakeAmount = amount;
        cam.shakeDuration = duration;
        return cam;
      },

      limit: function (bx, by, bw, bh) {
        cam.bounds = { x: bx, y: by, w: bw, h: bh };
        return cam;
      },

      limitTo: function (map) {
        cam.bounds = { x: map.x, y: map.y, w: map.worldWidth(), h: map.worldHeight() };
        return cam;
      },

      noLimit: function () { cam.bounds = null; return cam; },

      dead: function (w, h) {
        cam.deadzoneW = w;
        cam.deadzoneH = (h === undefined) ? w : h;
        return cam;
      },

      snapToTarget: function () {
        if (!cam.target) return cam;
        cam.x = cam.target.x + (cam.target.w || 0) * 0.5 + cam.targetOffsetX;
        cam.y = cam.target.y + (cam.target.h || 0) * 0.5 + cam.targetOffsetY;
        return cam;
      },

      use: function () { prism._activeCamera = cam; return cam; },
      begin: function () { prism.beginCamera(cam); return cam; },
      end: function () { prism.endCamera(); return cam; },
      scope: function (fn) {
        prism.beginCamera(cam);
        fn();
        prism.endCamera();
        return cam;
      }
    };
    return cam;
  };

  prism.updateCamera = function (cam, dt) {
    if (!cam) return;

    if (cam.target) {
      var tx = cam.target.x + (cam.target.w || 0) * 0.5 + cam.targetOffsetX;
      var ty = cam.target.y + (cam.target.h || 0) * 0.5 + cam.targetOffsetY;

      if (cam.followX) {
        var dx = tx - cam.x;
        var dzW = cam.deadzoneW * 0.5;
        if (dzW > 0) {
          if (dx > dzW) cam.x += (dx - dzW) * cam.lerpX;
          else if (dx < -dzW) cam.x += (dx + dzW) * cam.lerpX;
        } else {
          cam.x += dx * cam.lerpX;
        }
      }

      if (cam.followY) {
        var dy = ty - cam.y;
        var dzH = cam.deadzoneH * 0.5;
        if (dzH > 0) {
          if (dy > dzH) cam.y += (dy - dzH) * cam.lerpY;
          else if (dy < -dzH) cam.y += (dy + dzH) * cam.lerpY;
        } else {
          cam.y += dy * cam.lerpY;
        }
      }
    }

    if (cam.bounds) {
      var hw = (prism.width * 0.5) / cam.zoom;
      var hh = (prism.height * 0.5) / cam.zoom;
      if (cam.bounds.w <= hw * 2) {
        cam.x = cam.bounds.x + cam.bounds.w * 0.5;
      } else {
        if (cam.x - hw < cam.bounds.x) cam.x = cam.bounds.x + hw;
        if (cam.x + hw > cam.bounds.x + cam.bounds.w) cam.x = cam.bounds.x + cam.bounds.w - hw;
      }
      if (cam.bounds.h <= hh * 2) {
        cam.y = cam.bounds.y + cam.bounds.h * 0.5;
      } else {
        if (cam.y - hh < cam.bounds.y) cam.y = cam.bounds.y + hh;
        if (cam.y + hh > cam.bounds.y + cam.bounds.h) cam.y = cam.bounds.y + cam.bounds.h - hh;
      }
    }

    if (cam.shakeDuration > 0) {
      cam.shakeDuration -= dt;
      cam.shakeX = (Math.random() * 2 - 1) * cam.shakeAmount;
      cam.shakeY = (Math.random() * 2 - 1) * cam.shakeAmount;
      if (cam.shakeDuration <= 0) {
        cam.shakeX = 0; cam.shakeY = 0; cam.shakeAmount = 0;
      }
    }
  };

  prism.beginCamera = function (cam) {
    if (!cam) return;
    var ctx = prism.ctx;
    var canSnap = prism._pixelSnap && cam.zoom === 1 && cam.rotation === 0;

    ctx.save();
    ctx.translate(
      Math.round(prism.width * 0.5 + cam.offsetX),
      Math.round(prism.height * 0.5 + cam.offsetY)
    );
    if (cam.zoom !== 1) ctx.scale(cam.zoom, cam.zoom);
    if (cam.rotation) ctx.rotate(cam.rotation);

    var tx = -cam.x + cam.shakeX;
    var ty = -cam.y + cam.shakeY;
    if (canSnap) {
      ctx.translate(Math.round(tx), Math.round(ty));
    } else {
      ctx.translate(tx, ty);
    }
  };

  prism.endCamera = function () { prism.ctx.restore(); };

  prism.toWorld = function (cam, sx, sy) {
    if (!cam) return { x: sx, y: sy };
    return {
      x: (sx - prism.width * 0.5 - cam.offsetX) / cam.zoom + cam.x - cam.shakeX,
      y: (sy - prism.height * 0.5 - cam.offsetY) / cam.zoom + cam.y - cam.shakeY
    };
  };

  prism.toScreen = function (cam, wx, wy) {
    if (!cam) return { x: wx, y: wy };
    return {
      x: (wx - cam.x + cam.shakeX) * cam.zoom + prism.width * 0.5 + cam.offsetX,
      y: (wy - cam.y + cam.shakeY) * cam.zoom + prism.height * 0.5 + cam.offsetY
    };
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  prism._getAudioCtx = function () {
    if (!prism._audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) prism._audioCtx = new AC();
    }
    return prism._audioCtx;
  };

  prism._resumeAudio = function () {
    var ctx = prism._getAudioCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
  };

  prism.loadSound = function (name, src, cb) {
    var audio = new Audio();
    audio.preload = "auto";
    audio.oncanplaythrough = function () {
      prism._sounds[name] = { element: audio, src: src };
      if (cb) cb(audio);
    };
    audio.onerror = function () {
      console.warn("Prism2D: sound failed " + src);
      if (cb) cb(null);
    };
    audio.src = src;
    return prism;
  };

  prism.loadSounds = function (list, done) {
    var keys = Object.keys(list);
    var remaining = keys.length;
    if (remaining === 0) { if (done) done(); return prism; }
    for (var i = 0; i < keys.length; i++) {
      (function (name) {
        prism.loadSound(name, list[name], function () {
          remaining--;
          if (remaining === 0 && done) done();
        });
      })(keys[i]);
    }
    return prism;
  };

  prism.playSound = function (name, opts) {
    opts = opts || {};
    var entry = prism._sounds[name];
    if (!entry) return prism;
    prism._resumeAudio();
    var audio = entry.element.cloneNode(true);
    audio.volume = (opts.volume !== undefined) ? prism.clamp(opts.volume, 0, 1) : 1;
    audio.loop = !!opts.loop;
    if (opts.rate) audio.playbackRate = opts.rate;
    audio.play().catch(function () {});
    if (opts.loop) {
      prism._sounds[name]._loopInstance = audio;
    }
    return audio;
  };

  prism.stopSound = function (name) {
    var entry = prism._sounds[name];
    if (!entry) return prism;
    if (entry._loopInstance) {
      entry._loopInstance.pause();
      entry._loopInstance.currentTime = 0;
      entry._loopInstance = null;
    }
    return prism;
  };

  prism.soundVolume = function (name, vol) {
    var entry = prism._sounds[name];
    if (entry && entry._loopInstance) {
      entry._loopInstance.volume = prism.clamp(vol, 0, 1);
    }
    return prism;
  };

  prism.beep = function (freq, duration, vol, type) {
    var ctx = prism._getAudioCtx();
    if (!ctx) return prism;
    prism._resumeAudio();
    freq = freq || 440;
    duration = duration || 0.15;
    vol = (vol !== undefined) ? vol : 0.3;
    type = type || "square";

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    return prism;
  };

})(typeof window !== "undefined" ? window : this);
