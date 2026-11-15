/*

*/

(function (global) {

  var prism = function (w, h, parent) {
    return prism.init({ width: w, height: h, parent: parent });
  };

  prism.version = "1.5.2-beta";
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
  prism._paused = false;
  prism._timeScale = 1;
  prism._masterVol = 1;
  prism._plugins = {};
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
    prism._emit("init", prism);

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

      if (prism._paused) prism._accumulator = 0;

      while (!prism._paused && prism._accumulator >= prism._timestep) {
        var dt = prism._timestep / 1000 * prism._timeScale;

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

  if (prism._objectsLoaded) return;
  prism._objectsLoaded = true;

  if (!prism._pidCounter) {
    prism._pidCounter = 1;
  }
  
  prism._nextPid = function () { 
    return prism._pidCounter++; 
  };

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
      _autoSize: false,
      _vxSetThisFrame: false
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

    obj.body = function (cfg) {
      obj._isBody = true;
      if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
        var bodyType = cfg.type;
        if (bodyType !== "static" && bodyType !== "kinematic" && bodyType !== "dynamic") {
          bodyType = "dynamic";
        }

        if (bodyType === "static") {
          obj.gravity = false;
          obj.frozen = true;
        } else if (bodyType === "kinematic") {
          obj.gravity = false;
          obj.frozen = false;
        } else {
          obj.gravity = true;
          obj.frozen = false;
        }

        if (cfg.gravityScale !== undefined) {
          obj.gravityScale = cfg.gravityScale;
        }
        if (cfg.friction !== undefined) {
          obj.friction = cfg.friction;
        }
        if (cfg.restitution !== undefined) {
          obj.bounce = cfg.restitution;
        }
        if (cfg.maxSpeed !== undefined) {
          if (Array.isArray(cfg.maxSpeed)) {
            obj.maxVX = cfg.maxSpeed[0];
            obj.maxVY = cfg.maxSpeed[1];
          } else {
            obj.maxVX = cfg.maxSpeed;
            obj.maxVY = cfg.maxSpeed;
          }
        }
      } else {
        obj.gravity = true;
        obj.frozen = false;
      }
      prism.addBody(obj);
      return obj;
    };

    obj.kinematic = function () {
      obj.gravity = false;
      obj.frozen = false;
      obj._isBody = true;
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
      if (vx !== undefined && vx !== null) {
        obj.vx = vx;
        obj._vxSetThisFrame = true;
      }
      if (vy !== undefined && vy !== null) obj.vy = vy;
      return obj;
    };

    obj.velX = function (vx) {
      obj.vx = vx;
      obj._vxSetThisFrame = true;
      return obj;
    };

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
      obj.vx = ix * speed;
      obj.vy = iy * speed;
      obj._vxSetThisFrame = true;
      return obj;
    };

    obj.moveDir = function (a, speed) {
      obj.vx = Math.cos(a) * speed;
      obj.vy = Math.sin(a) * speed;
      obj._vxSetThisFrame = true;
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
      obj.vx = (dx / d) * speed;
      obj.vy = (dy / d) * speed;
      obj._vxSetThisFrame = true;
      return obj;
    };

    obj.addForce = function (fx, fy) {
      obj.vx += fx;
      obj.vy += (fy === undefined ? 0 : fy);
      return obj;
    };

    obj.impulse = function (fx, fy) {
      obj.vx = fx;
      obj._vxSetThisFrame = true;
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
      obj._vxSetThisFrame = true;
      return obj;
    };

    obj.dash = function (dx, dy, speed) {
      var len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) { dx /= len; dy /= len; }
      obj.vx = dx * speed; obj.vy = dy * speed;
      obj._vxSetThisFrame = true;
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
      if (obj._pid) {
        var pidStr = String(obj._pid);
        for (var k in prism._contacts) {
          var parts = k.split("|");
          if (parts[0] === pidStr || parts[1] === pidStr) {
            delete prism._contacts[k];
          }
        }
      }
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
      if (b.friction && !b._vxSetThisFrame) {
        b.vx *= (1 - prism.clamp(b.friction * dt * 60, 0, 1));
      }
      b._vxSetThisFrame = false;
      if (b.maxVX !== undefined) b.vx = prism.clamp(b.vx, -b.maxVX, b.maxVX);
      if (b.maxVY !== undefined) b.vy = prism.clamp(b.vy, -b.maxVY, b.maxVY);
    }
  };

  prism._moveBodies = function (dt) {
    for (var i = 0; i < prism._bodies.length; i++) {
      var b = prism._bodies[i];
      if (b.frozen) {
        b._prevX = b.x;
        b._prevY = b.y;
        continue;
      }
      b._prevX = b.x;
      b._prevY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.wasGrounded = b.grounded;
      if (b.grounded) {
        b.coyote = 0.1;
      } else if (b.coyote > 0) {
        b.coyote -= dt;
        if (b.coyote < 0) b.coyote = 0;
      }
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
    if (!a || !b || a.visible === false || b.visible === false) return false;
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
    if (!moving || !solid) return null;
    if (moving.sensor || solid.sensor) return null;
    if (moving.visible === false || solid.visible === false) return null;

    if (moving.type === "circle" && solid.type === "circle") return prism.solveCC(moving, solid);
    if (moving.type === "circle") return prism.solveCR(moving, solid);

    var A = boundsOf(moving), B = boundsOf(solid);
    var dx = (A.x + A.w * 0.5) - (B.x + B.w * 0.5);
    var dy = (A.y + A.h * 0.5) - (B.y + B.h * 0.5);
    var oX = (A.w * 0.5 + B.w * 0.5) - Math.abs(dx);
    var oY = (A.h * 0.5 + B.h * 0.5) - Math.abs(dy);
    if (oX <= 0 || oY <= 0) return null;

    if (solid.oneWay) {
      var prevBottomOW = (moving._prevY !== undefined ? moving._prevY : moving.y) + A.h;
      if (prevBottomOW > solid.y + 8 || moving.vy < 0) return null;
      moving.y = solid.y - A.h;
      moving.vy = 0;
      moving.grounded = true;
      moving.coyote = 0.1;
      return "bottom";
    }

    var prevLeft = moving._prevX !== undefined ? moving._prevX : moving.x;
    var prevRight = prevLeft + A.w;
    var prevTop = moving._prevY !== undefined ? moving._prevY : moving.y;
    var prevBottom = prevTop + A.h;

    var wasOverlappingX = prevRight > B.x && prevLeft < B.x + B.w;
    var wasOverlappingY = prevBottom > B.y && prevTop < B.y + B.h;

    var resolveX;
    if (wasOverlappingY && !wasOverlappingX) {
      resolveX = true;
    } else if (wasOverlappingX && !wasOverlappingY) {
      resolveX = false;
    } else {
      resolveX = (oX < oY);
    }

    var bounce = (opts.bounce !== undefined) ? opts.bounce : (moving.bounce || 0);
    var side;

    if (resolveX) {
      if (dx > 0) { moving.x += oX; side = "left"; }
      else { moving.x -= oX; side = "right"; }
      if (bounce > 0) {
        moving.vx = -moving.vx * bounce;
      } else {
        moving.vx = 0;
      }
    } else {
      if (dy > 0) {
        moving.y += oY;
        side = "top";
        if (moving.vy < 0) {
          if (bounce > 0) moving.vy = -moving.vy * bounce;
          else moving.vy = 0;
        }
      } else {
        moving.y -= oY;
        side = "bottom";
        moving.grounded = true;
        moving.coyote = 0.1;
        if (moving.vy > 0) {
          if (bounce > 0) moving.vy = -moving.vy * bounce;
          else moving.vy = 0;
        }
      }
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
    a.x += nx * o;
    a.y += ny * o;
    var bounce = a.bounce || 0;
    var dot = a.vx * nx + a.vy * ny;
    a.vx -= (1 + bounce) * dot * nx;
    a.vy -= (1 + bounce) * dot * ny;
    if (ny < -0.5) {
      a.grounded = true;
      a.coyote = 0.1;
    }
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
    c.x += nX * o;
    c.y += nY * o;
    var bounce = c.bounce || 0;
    var dot = c.vx * nX + c.vy * nY;
    c.vx -= (1 + bounce) * dot * nX;
    c.vy -= (1 + bounce) * dot * nY;
    if (nY < -0.5) {
      c.grounded = true;
      c.coyote = 0.1;
    }
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
      xEntry = xInvEntry / vx;
      xExit = xInvExit / vx;
    }

    var yOverlap = A.y < B.y + B.h && A.y + A.h > B.y;
    if (vy === 0) {
      yEntry = yOverlap ? -Infinity : Infinity;
      yExit = yOverlap ? Infinity : -Infinity;
    } else {
      yEntry = yInvEntry / vy;
      yExit = yInvExit / vy;
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
        if (solids[i] === moving || solids[i].sensor || solids[i].visible === false) continue;
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
        if (nearest.ny < 0) {
          moving.grounded = true;
          moving.coyote = 0.1;
        }
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
      if (!t || t.visible === false) continue;
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
    obj.x = x;
    obj.y = y;
    obj._prevX = x;
    obj._prevY = y;
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
    var original = prism.group(tag);
    var list = original.slice();
    if (!obj._pid) obj._pid = prism._nextPid();
    for (var i = 0; i < list.length; i++) {
      var other = list[i];
      if (!other || other === obj) continue;
      if (!other._pid) other._pid = prism._nextPid();
      var key = prism._pairKey(obj, other);
      var was = prism._contacts[key] === true;
      var now = (other.visible !== false) && prism.collide(obj, other);
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
    var original = prism.group(tag);
    var list = original.slice();
    
    var candidates = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || s === obj || s.sensor || s.visible === false) continue;
      if (prism.collide(obj, s)) {
        candidates.push(s);
      }
    }

    candidates.sort(function (a, b) {
      var oa = prism.overlap(obj, a);
      var ob = prism.overlap(obj, b);
      return (ob ? ob.area : 0) - (oa ? oa.area : 0);
    });

    var sides = [];
    for (var j = 0; j < candidates.length; j++) {
      var target = candidates[j];
      if (prism.collide(obj, target)) {
        var side = prism.solve(obj, target, opts);
        if (side) sides.push({ side: side, target: target });
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

  function getCamX(cam) {
    if (!prism._interpolate || cam._prevX === undefined) return cam.x;
    return cam._prevX + (cam.x - cam._prevX) * prism._alpha;
  }

  function getCamY(cam) {
    if (!prism._interpolate || cam._prevY === undefined) return cam.y;
    return cam._prevY + (cam.y - cam._prevY) * prism._alpha;
  }

  prism.camera = function (x, y) {
    var cam = {
      x: x || 0,
      y: y || 0,
      _prevX: x || 0,
      _prevY: y || 0,
      zoom: 1, 
      rotation: 0,
      target: null,
      lerpX: 1, 
      lerpY: 1,
      followX: true, 
      followY: true,
      offsetX: 0, 
      offsetY: 0,
      targetOffsetX: 0, 
      targetOffsetY: 0,
      shakeAmount: 0, 
      shakeDuration: 0,
      shakeX: 0, 
      shakeY: 0,
      bounds: null,
      deadzoneW: 0, 
      deadzoneH: 0,

      at: function (px, py) { 
        cam.x = px; 
        cam.y = py; 
        cam._prevX = px;
        cam._prevY = py;
        return cam; 
      },
      
      moveBy: function (dx, dy) { 
        cam.x += dx; 
        cam.y += dy; 
        return cam; 
      },
      
      zoomTo: function (z) { 
        cam.zoom = z; 
        return cam; 
      },
      
      rotateTo: function (r) { 
        cam.rotation = r; 
        return cam; 
      },

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
        cam.followX = !!fx; 
        cam.followY = !!fy;
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
        cam._prevX = cam.x;
        cam._prevY = cam.y;
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

    cam._prevX = cam.x;
    cam._prevY = cam.y;

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
        cam.shakeX = 0; 
        cam.shakeY = 0; 
        cam.shakeAmount = 0;
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

    var cx = getCamX(cam);
    var cy = getCamY(cam);
    var tx = -cx + cam.shakeX;
    var ty = -cy + cam.shakeY;
    if (canSnap) {
      ctx.translate(Math.round(tx), Math.round(ty));
    } else {
      ctx.translate(tx, ty);
    }
  };

  prism.endCamera = function () { prism.ctx.restore(); };

  prism.toWorld = function (cam, sx, sy) {
    if (!cam) return { x: sx, y: sy };
    var cx = getCamX(cam);
    var cy = getCamY(cam);
    return {
      x: (sx - prism.width * 0.5 - cam.offsetX) / cam.zoom + cx - cam.shakeX,
      y: (sy - prism.height * 0.5 - cam.offsetY) / cam.zoom + cy - cam.shakeY
    };
  };

  prism.toScreen = function (cam, wx, wy) {
    if (!cam) return { x: wx, y: wy };
    var cx = getCamX(cam);
    var cy = getCamY(cam);
    return {
      x: (wx - cx + cam.shakeX) * cam.zoom + prism.width * 0.5 + cam.offsetX,
      y: (wy - cy + cam.shakeY) * cam.zoom + prism.height * 0.5 + cam.offsetY
    };
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
    img.onerror = function () { if (cb) cb(null); };
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

  prism.loadFont = function (name, src, cb) {
    var font = new FontFace(name, "url('" + src + "')");
    font.load().then(function (loaded) {
      document.fonts.add(loaded);
      if (cb) cb(loaded);
    }).catch(function () {
      if (cb) cb(null);
    });
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
    config = config || {};
    var e = {
      x: config.x !== undefined ? config.x : 0,
      y: config.y !== undefined ? config.y : 0,
      active: config.active !== undefined ? config.active : true,
      rate: config.rate !== undefined ? config.rate : 10,
      burst: config.burst !== undefined ? config.burst : 0,
      maxParticles: config.max !== undefined ? config.max : 200,
      _particles: [],
      _timer: 0,
      _burstDone: false,

      minLife: config.minLife !== undefined ? config.minLife : 0.5,
      maxLife: config.maxLife !== undefined ? config.maxLife : 2.0,
      minSpeed: config.minSpeed !== undefined ? config.minSpeed : 20,
      maxSpeed: config.maxSpeed !== undefined ? config.maxSpeed : 100,
      minAngle: config.minAngle !== undefined ? config.minAngle : 0,
      maxAngle: config.maxAngle !== undefined ? config.maxAngle : Math.PI * 2,
      minSize: config.minSize !== undefined ? config.minSize : 2,
      maxSize: config.maxSize !== undefined ? config.maxSize : 6,
      endSize: config.endSize !== undefined ? config.endSize : 0,
      colors: config.colors || ["#fff"],
      shape: config.shape || "rect",
      gravity: config.gravity !== undefined ? config.gravity : 0,
      fadeOut: config.fadeOut !== undefined ? config.fadeOut : true,
      spread: config.spread !== undefined ? config.spread : 0,
      friction: config.friction !== undefined ? config.friction : 0,

      at: function (x, y) { e.x = x; e.y = y; return e; },

      emit: function (count) {
        count = count || 1;
        for (var i = 0; i < count; i++) {
          if (e._particles.length >= e.maxParticles) break;
          var angle = prism.randf(e.minAngle, e.maxAngle);
          var speed = prism.randf(e.minSpeed, e.maxSpeed);
          var life = prism.randf(e.minLife, e.maxLife);
          if (life <= 0) life = 0.001;
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
            p.alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
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
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
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
      ctx.resume().catch(function() {});
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
    try {
      var audio = entry.element.cloneNode(true);
      audio.volume = prism.clamp((opts.volume !== undefined ? opts.volume : 1) * prism._masterVol, 0, 1);
      audio.loop = !!opts.loop;
      if (opts.rate) audio.playbackRate = opts.rate;
      audio.play().catch(function () {});
      if (opts.loop) {
        prism._sounds[name]._loopInstance = audio;
      }
      return audio;
    } catch (e) {
      return null;
    }
  };

  prism.stopSound = function (name) {
    var entry = prism._sounds[name];
    if (!entry) return prism;
    if (entry._loopInstance) {
      try {
        entry._loopInstance.pause();
        entry._loopInstance.currentTime = 0;
        entry._loopInstance = null;
      } catch (e) {}
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
    try {
      var ctx = prism._getAudioCtx();
      if (!ctx) return prism;
      prism._resumeAudio();
      freq = freq || 440;
      duration = duration || 0.15;
      vol = (vol !== undefined ? vol : 0.3) * prism._masterVol;
      type = type || "square";

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
    return prism;
  };

})(typeof window !== "undefined" ? window : this);
(function (global) {

  var prism = global.prism;

  var themes = {
    dark: {
      font: "Arial", size: 16, pad: 10, gap: 8, radius: 6, border: "#3a3f4b", borderWidth: 1,
      panel: "rgba(24,26,33,0.92)", bg: "#2d323d", hover: "#3d4452", press: "#1f232b",
      accent: "#4c9aff", text: "#f2f4f8", dim: "#8b93a5", disabled: "#23262e", track: "#1b1e25",
      overlay: "rgba(0,0,0,0.55)", tipBg: "#000000", tipText: "#ffffff"
    },
    light: {
      font: "Arial", size: 16, pad: 10, gap: 8, radius: 6, border: "#c4c9d4", borderWidth: 1,
      panel: "rgba(250,251,253,0.96)", bg: "#e6e9f0", hover: "#d6dbe6", press: "#c3c9d8",
      accent: "#1e6fe0", text: "#1b1f27", dim: "#6b7385", disabled: "#eef0f4", track: "#d3d8e2",
      overlay: "rgba(0,0,0,0.35)", tipBg: "#1b1f27", tipText: "#ffffff"
    },
    retro: {
      font: "monospace", size: 14, pad: 8, gap: 6, radius: 0, border: "#ffffff", borderWidth: 2,
      panel: "#101030", bg: "#202060", hover: "#3030a0", press: "#101040",
      accent: "#ffd400", text: "#ffffff", dim: "#8888cc", disabled: "#181838", track: "#000020",
      overlay: "rgba(0,0,16,0.7)", tipBg: "#ffd400", tipText: "#000000"
    }
  };

  var ui = prism.ui = {
    themes: themes,
    theme: {},
    roots: [],
    hot: null,
    active: null,
    focus: null,
    captured: false,
    typing: false,
    nav: false,
    toasts: []
  };

  var nextId = 1, lastNow = 0, hoverTime = 0;

  ui.setTheme = function (t) {
    var src = typeof t === "string" ? themes[t] : t;
    if (!src) return ui;
    for (var k in src) ui.theme[k] = src[k];
    return ui;
  };
  ui.setTheme("dark");

  var proto = {
    on: function (ev, fn) {
      (this._h[ev] = this._h[ev] || []).push(fn);
      if (ev === "click" || ev === "press") this.clickable = true;
      return this;
    },
    off: function (ev, fn) {
      var l = this._h[ev];
      if (l && fn) { var i = l.indexOf(fn); if (i > -1) l.splice(i, 1); }
      else delete this._h[ev];
      return this;
    },
    emit: function (ev, arg) {
      var l = this._h[ev];
      if (l) for (var i = 0; i < l.length; i++) l[i].call(this, arg, this);
      return this;
    },
    add: function (c) {
      if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1);
      else { var r = ui.roots.indexOf(c); if (r > -1) ui.roots.splice(r, 1); }
      c.parent = this;
      this.children.push(c);
      return this;
    },
    remove: function () {
      var list = this.parent ? this.parent.children : ui.roots;
      var i = list.indexOf(this);
      if (i > -1) list.splice(i, 1);
      this.parent = null;
      if (ui.focus === this) ui.blur();
      if (ui.active === this) ui.active = null;
      if (ui.hot === this) ui.hot = null;
      return this;
    },
    clear: function () {
      while (this.children.length) this.children[0].remove();
      return this;
    },
    set: function (props) {
      for (var k in props) this[k] = props[k];
      if (props.w !== undefined) this._fw = true;
      if (props.h !== undefined) this._fh = true;
      return this;
    },
    setText: function (t) { this.text = String(t); return this; },
    setValue: function (v, silent) {
      if (this.type === "toggle") v = !!v;
      else {
        v = prism.clamp(v, this.min, this.max);
        if (this.step) v = this.min + Math.round((v - this.min) / this.step) * this.step;
      }
      if (v === this.value) return this;
      this.value = v;
      if (!silent) this.emit("change", v);
      return this;
    },
    at: function (x, y) { this.ox = x; this.oy = y; return this; },
    size: function (w, h) { this.w = w; this.h = h; this._fw = this._fh = true; return this; },
    show: function () { this.visible = true; return this; },
    hide: function () { this.visible = false; return this; },
    enable: function () { this.enabled = true; return this; },
    disable: function () { this.enabled = false; return this; },
    toFront: function () {
      var list = this.parent ? this.parent.children : ui.roots;
      var i = list.indexOf(this);
      if (i > -1) { list.splice(i, 1); list.push(this); }
      return this;
    },
    rect: function () { return { x: this._r.x, y: this._r.y, w: this._r.w, h: this._r.h }; }
  };

  function make(type, o) {
    o = o || {};
    var w = Object.create(proto);
    w.id = nextId++;
    w.type = type;
    w.ox = 0; w.oy = 0; w.w = 0; w.h = 0;
    w.anchor = "topleft"; w.align = "start";
    w.visible = true; w.enabled = true; w.z = 0; w.alpha = 1;
    w.children = []; w.parent = null; w.layout = null;
    w.text = ""; w.value = 0; w.min = 0; w.max = 1; w.step = 0;
    w.gap = null; w.pad = null; w.size_ = null;
    w._h = {}; w._t = 0; w._fw = false; w._fh = false;
    w._r = { x: 0, y: 0, w: 0, h: 0 };
    var parent = o.parent;
    for (var k in o) if (k !== "parent") w[k] = o[k];
    if (o.x !== undefined) w.ox = o.x;
    if (o.y !== undefined) w.oy = o.y;
    if (o.w !== undefined) w._fw = true;
    if (o.h !== undefined) w._fh = true;
    if (o.size !== undefined && typeof o.size === "number") { w.size_ = o.size; w.size = proto.size; }
    if (o.onClick) w.on("click", o.onClick);
    if (o.onChange) w.on("change", o.onChange);
    if (o.onSubmit) w.on("submit", o.onSubmit);
    if (parent) parent.add(w);
    else ui.roots.push(w);
    return w;
  }

  ui.label = function (text, o) { o = o || {}; o.text = String(text === undefined ? "" : text); return make("label", o); };
  ui.button = function (text, o, fn) {
    if (typeof o === "function") { fn = o; o = {}; }
    o = o || {}; o.text = String(text);
    if (fn) o.onClick = fn;
    return make("button", o);
  };
  ui.panel = function (o) { return make("panel", o); };
  ui.bar = function (o) { o = o || {}; if (o.value === undefined) o.value = 1; if (o.smooth === undefined) o.smooth = true; var w = make("bar", o); w._disp = w.value; return w; };
  ui.slider = function (o) { o = o || {}; if (o.value === undefined) o.value = o.min || 0; return make("slider", o); };
  ui.toggle = function (text, o) { o = o || {}; o.text = String(text); o.value = !!o.value; return make("toggle", o); };
  ui.input = function (o) { o = o || {}; o.value = o.value === undefined ? "" : String(o.value); return make("input", o); };
  ui.image = function (image, o) { o = o || {}; o.image = image; return make("image", o); };

  ui.clear = function (scene) {
    for (var i = ui.roots.length - 1; i >= 0; i--) {
      if (!scene || ui.roots[i].scene === scene) ui.roots[i].remove();
    }
    return ui;
  };

  ui.blur = function () {
    var f = ui.focus;
    ui.focus = null;
    ui.typing = false;
    if (f) f.emit("blur");
    return ui;
  };

  ui.setFocus = function (w) {
    if (ui.focus === w) return ui;
    ui.blur();
    ui.focus = w;
    ui.typing = !!w && w.type === "input";
    if (w) w.emit("focus");
    return ui;
  };

  ui.toast = function (text, seconds, color) {
    ui.toasts.push({ text: String(text), life: seconds || 2.5, age: 0, color: color });
    return ui;
  };

  ui.dialog = function (o) {
    o = o || {};
    var overlay = ui.panel({ fill: true, block: true, z: 1000, overlay: true });
    var box = ui.panel({ parent: overlay, anchor: "center", layout: "v", align: "center", title: o.title, w: o.width });
    if (o.text) ui.label(o.text, { parent: box, wrap: o.width ? o.width - 40 : 320 });
    if (o.content) o.content(box);
    var row = ui.panel({ parent: box, layout: "h", transparent: true, pad: 0 });
    var api = { overlay: overlay, box: box, close: function () { overlay.remove(); if (o.onClose) o.onClose(); } };
    var buttons = o.buttons || [{ text: "OK" }];
    for (var i = 0; i < buttons.length; i++) {
      (function (b) {
        ui.button(b.text, { parent: row, primary: !!b.primary }, function () {
          if (b.onClick) b.onClick(api);
          if (b.keep !== true) api.close();
        });
      })(buttons[i]);
    }
    return api;
  };

  ui.confirm = function (text, yes, no, title) {
    return ui.dialog({
      title: title, text: text,
      buttons: [{ text: "Yes", primary: true, onClick: yes }, { text: "No", onClick: no }]
    });
  };

  function fontSize(w) { return w.size_ || ui.theme.size; }
  function padOf(w) { return w.pad === null ? (w.type === "panel" && !w.transparent ? ui.theme.pad : 0) : w.pad; }
  function gapOf(w) { return w.gap === null ? ui.theme.gap : w.gap; }
  function colorOf(w, key) { return w[key + "Color"] || ui.theme[key]; }

  function lines(w) {
    var s = String(w.text), sz = fontSize(w);
    if (!w.wrap) return s.split("\n");
    var out = [], paras = s.split("\n");
    for (var p = 0; p < paras.length; p++) {
      var words = paras[p].split(" "), cur = "";
      for (var i = 0; i < words.length; i++) {
        var test = cur ? cur + " " + words[i] : words[i];
        if (cur && prism.measureText(test, sz, ui.theme.font) > w.wrap) { out.push(cur); cur = words[i]; }
        else cur = test;
      }
      out.push(cur);
    }
    return out;
  }

  function textW(w, text) { return prism.measureText(text, fontSize(w), ui.theme.font); }

  function measure(w) {
    var i, c, sz = fontSize(w), t = ui.theme;
    for (i = 0; i < w.children.length; i++) measure(w.children[i]);
    if (w.fill) { w.w = prism.width; w.h = prism.height; return; }
    var type = w.type;
    if (type === "label") {
      var ls = lines(w), mw = 0;
      for (i = 0; i < ls.length; i++) mw = Math.max(mw, textW(w, ls[i]));
      w._lines = ls;
      if (!w._fw) w.w = mw;
      if (!w._fh) w.h = ls.length * sz * 1.25;
    } else if (type === "button") {
      if (!w._fw) w.w = textW(w, w.text) + sz * 1.6;
      if (!w._fh) w.h = sz * 2.1;
    } else if (type === "toggle") {
      if (!w._fw) w.w = sz * 1.2 + t.gap + textW(w, w.text);
      if (!w._fh) w.h = sz * 1.4;
    } else if (type === "slider") {
      if (!w._fw) w.w = 180;
      if (!w._fh) w.h = (w.text || w.showValue) ? sz * 2.4 : sz * 1.4;
    } else if (type === "bar") {
      if (!w._fw) w.w = 180;
      if (!w._fh) w.h = Math.round(sz * 1.1);
    } else if (type === "input") {
      if (!w._fw) w.w = 220;
      if (!w._fh) w.h = sz * 2.1;
    } else if (type === "image") {
      var img = typeof w.image === "object" ? w.image : prism._images[w.image];
      if (img && !w._fw) w.w = img.naturalWidth || img.width || 0;
      if (img && !w._fh) w.h = img.naturalHeight || img.height || 0;
    } else if (type === "panel") {
      var pad = padOf(w), g = gapOf(w), vis = [];
      w._top = pad + (w.title ? sz * 1.8 : 0);
      for (i = 0; i < w.children.length; i++) if (w.children[i].visible) vis.push(w.children[i]);
      var cw = 0, ch = 0;
      if (w.layout === "v" || w.layout === "h") {
        for (i = 0; i < vis.length; i++) {
          c = vis[i];
          if (w.layout === "v") { cw = Math.max(cw, c.w); ch += c.h + (i ? g : 0); }
          else { cw += c.w + (i ? g : 0); ch = Math.max(ch, c.h); }
        }
      } else {
        for (i = 0; i < vis.length; i++) { cw = Math.max(cw, vis[i].w); ch = Math.max(ch, vis[i].h); }
        if (!vis.length) { cw = 160; ch = 80; }
      }
      var tw = w.title ? textW(w, w.title) : 0;
      if (!w._fw) w.w = Math.max(cw, tw) + pad * 2;
      if (!w._fh) w.h = ch + w._top + pad;
    }
  }

  function fractions(a) {
    return [a.indexOf("left") > -1 ? 0 : (a.indexOf("right") > -1 ? 1 : 0.5), a.indexOf("top") > -1 ? 0 : (a.indexOf("bottom") > -1 ? 1 : 0.5)];
  }

  function place(w, x, y) {
    w._r.x = x; w._r.y = y; w._r.w = w.w; w._r.h = w.h;
    if (!w.children.length) return;
    var i, c, pad = padOf(w), g = gapOf(w), top = w._top === undefined ? pad : w._top;
    var innerW = w.w - pad * 2, innerH = w.h - top - pad;
    var vis = [];
    for (i = 0; i < w.children.length; i++) if (w.children[i].visible) vis.push(w.children[i]);
    if (w.layout === "v" || w.layout === "h") {
      var cx = x + pad, cy = y + top, v = w.layout === "v";
      for (i = 0; i < vis.length; i++) {
        c = vis[i];
        var cross = v ? innerW : innerH, size = v ? c.w : c.h, off = 0;
        if (w.align === "stretch" && !(v ? c._fw : c._fh)) { if (v) c.w = innerW; else c.h = innerH; size = cross; }
        else if (w.align === "center") off = (cross - size) / 2;
        else if (w.align === "end") off = cross - size;
        if (v) { place(c, cx + off + c.ox, cy + c.oy); cy += c.h + g; }
        else { place(c, cx + c.ox, cy + off + c.oy); cx += c.w + g; }
      }
    } else {
      for (i = 0; i < vis.length; i++) {
        c = vis[i];
        var f = fractions(c.anchor);
        place(c, x + pad + (innerW - c.w) * f[0] + c.ox, y + top + (innerH - c.h) * f[1] + c.oy);
      }
    }
  }

  function shown(w) {
    if (!w.visible) return false;
    if (w.scene) {
      var cur = prism._currentScene;
      if (!cur || cur.name !== w.scene) return false;
    }
    return true;
  }

  function byZ(list) {
    return list.map(function (w, i) { return [w, i]; }).sort(function (a, b) { return (a[0].z - b[0].z) || (a[1] - b[1]); }).map(function (p) { return p[0]; });
  }

  function layoutAll() {
    var order = [], i, r;
    var roots = byZ(ui.roots);
    for (i = 0; i < roots.length; i++) {
      r = roots[i];
      if (!shown(r)) continue;
      measure(r);
      var f = fractions(r.anchor);
      place(r, (prism.width - r.w) * f[0] + r.ox, (prism.height - r.h) * f[1] + r.oy);
      flatten(r, order);
    }
    return order;
  }

  function flatten(w, out) {
    out.push(w);
    var kids = byZ(w.children);
    for (var i = 0; i < kids.length; i++) if (kids[i].visible) flatten(kids[i], out);
  }

  function interactive(w) {
    return w.type === "button" || w.type === "toggle" || w.type === "slider" || w.type === "input" || w.clickable || w.block;
  }

  function inside(w, x, y) {
    var r = w._r;
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function sliderFromPointer(w, px) {
    var pad = fontSize(w) * 0.5, r = w._r;
    var n = prism.clamp((px - r.x - pad) / Math.max(1, r.w - pad * 2), 0, 1);
    w.setValue(w.min + n * (w.max - w.min));
  }

  function activate(w) {
    if (!w.enabled) return;
    if (w.type === "toggle") w.setValue(!w.value);
    else if (w.type === "input") {
      ui.setFocus(w);
      if (prism.isTouch() && typeof window.prompt === "function") {
        var v = window.prompt(w.placeholder || "", w.value);
        if (v !== null) { w.setValue(String(v).slice(0, w.maxLength || 9999)); w.emit("submit", w.value); }
        ui.blur();
      }
    }
    w.emit("click");
  }

  function focusables(order) {
    return order.filter(function (w) { return w.enabled && (w.type === "button" || w.type === "toggle" || w.type === "slider" || w.type === "input"); });
  }

  function navigate(order) {
    var list = focusables(order);
    if (!list.length) return;
    var dir = 0, k = prism.keyHit;
    if (k("Tab")) dir = prism.key("Shift") ? -1 : 1;
    else if (k("ArrowDown") || (ui.focus && ui.focus.type !== "slider" && k("ArrowRight"))) dir = 1;
    else if (k("ArrowUp") || (ui.focus && ui.focus.type !== "slider" && k("ArrowLeft"))) dir = -1;
    if (prism.pad.hit(13)) dir = 1;
    if (prism.pad.hit(12)) dir = -1;
    if (dir) {
      var i = list.indexOf(ui.focus);
      ui.setFocus(list[(i + dir + list.length) % list.length]);
    }
    var f = ui.focus;
    if (!f || f.type === "input") return;
    if (f.type === "slider") {
      var st = f.step || (f.max - f.min) / 20;
      if (k("ArrowLeft")) f.setValue(f.value - st);
      if (k("ArrowRight")) f.setValue(f.value + st);
    }
    if (k("Enter") || k(" ") || k("Space") || prism.pad.hit(0)) activate(f);
  }

  ui._process = function () {
    var now = performance.now(), dt = Math.min(0.1, (now - (lastNow || now)) / 1000);
    lastNow = now;
    var order = layoutAll(), i, w;
    var m = prism._mouse;
    var usePointer = !prism.isTouch() || m.down || m.justReleased;
    var hit = null;
    if (usePointer) {
      for (i = order.length - 1; i >= 0; i--) {
        w = order[i];
        if (interactive(w) && inside(w, m.x, m.y)) { hit = w; break; }
      }
    }
    if (hit !== ui.hot) {
      if (ui.hot) ui.hot.emit("leave");
      ui.hot = hit;
      hoverTime = 0;
      if (hit && hit.enabled) hit.emit("hover");
    } else hoverTime += dt;

    if (m.justPressed && hit) {
      if (hit.type === "input") ui.setFocus(hit);
      else if (ui.focus && ui.focus.type === "input") ui.blur();
      if (hit.enabled) {
        ui.active = hit;
        hit.emit("press");
        if (hit.type === "slider") sliderFromPointer(hit, m.x);
      }
    } else if (m.justPressed && ui.focus && ui.focus.type === "input") ui.blur();

    if (m.down && ui.active && ui.active.type === "slider") sliderFromPointer(ui.active, m.x);

    if (m.justReleased && ui.active) {
      var a = ui.active;
      ui.active = null;
      a.emit("release");
      if (a === hit && a.type !== "slider") activate(a);
    }

    ui.captured = !!hit || !!ui.active;
    if (ui.nav && !ui.typing) navigate(order);

    for (i = 0; i < order.length; i++) {
      w = order[i];
      var target = (w === ui.hot && w.enabled) ? 1 : 0;
      w._t += (target - w._t) * Math.min(1, dt * 14);
      if (w.type === "bar") {
        w._disp = w.smooth ? w._disp + (w.value - w._disp) * Math.min(1, dt * 10) : w.value;
      }
    }
    for (i = ui.toasts.length - 1; i >= 0; i--) {
      ui.toasts[i].age += dt;
      if (ui.toasts[i].age >= ui.toasts[i].life) ui.toasts.splice(i, 1);
    }
    ui._order = order;
  };

  function path(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (r <= 0) { ctx.rect(x, y, w, h); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function box(ctx, r, fill, stroke, radius, lw) {
    path(ctx, r.x, r.y, r.w, r.h, radius);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }

  function alphaOf(w) {
    var a = w.alpha;
    for (var p = w.parent; p; p = p.parent) a *= p.alpha;
    return a;
  }

  function drawWidget(ctx, w) {
    var t = ui.theme, r = w._r, sz = fontSize(w), radius = t.radius;
    var active = ui.active === w, hot = w === ui.hot;
    ctx.globalAlpha = alphaOf(w);
    var type = w.type;

    if (type === "panel") {
      if (w.fill && w.overlay) { ctx.fillStyle = t.overlay; ctx.fillRect(r.x, r.y, r.w, r.h); }
      else if (!w.transparent && !w.fill) box(ctx, r, w.bg || t.panel, t.border, radius, t.borderWidth);
      if (w.title) prism.drawText(w.title, r.x + padOf(w), r.y + padOf(w) * 0.8 + sz * 0.1, { size: sz + 1, bold: true, font: t.font, color: t.text });
    } else if (type === "label") {
      var ls = w._lines || [String(w.text)], col = w.color || t.text, al = w.textAlign || "left";
      var tx = al === "center" ? r.x + r.w / 2 : (al === "right" ? r.x + r.w : r.x);
      for (var i = 0; i < ls.length; i++) {
        prism.drawText(ls[i], tx, r.y + i * sz * 1.25, { size: sz, font: t.font, color: col, align: al, bold: w.bold, outline: w.outline });
      }
    } else if (type === "button") {
      var base = !w.enabled ? t.disabled : (w.primary ? t.accent : (w.bg || t.bg));
      var oy = active && w.enabled ? 1 : 0;
      var rr = { x: r.x, y: r.y + oy, w: r.w, h: r.h };
      box(ctx, rr, base, t.border, radius, t.borderWidth);
      if (w.enabled) {
        ctx.globalAlpha = alphaOf(w) * (active ? 0.35 : w._t * 0.45);
        box(ctx, rr, active ? t.press : t.hover, null, radius);
        ctx.globalAlpha = alphaOf(w);
      }
      var bc = !w.enabled ? t.dim : (w.primary ? "#fff" : (w.color || t.text));
      prism.drawText(w.text, r.x + r.w / 2, r.y + oy + (r.h - sz) / 2, { size: sz, font: t.font, color: bc, align: "center" });
    } else if (type === "toggle") {
      var bs = sz * 1.2, by = r.y + (r.h - bs) / 2;
      box(ctx, { x: r.x, y: by, w: bs, h: bs }, w.value ? t.accent : t.track, t.border, Math.min(radius, 4), t.borderWidth);
      if (w.value) {
        ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(2, sz * 0.14); ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(r.x + bs * 0.24, by + bs * 0.52); ctx.lineTo(r.x + bs * 0.43, by + bs * 0.72); ctx.lineTo(r.x + bs * 0.78, by + bs * 0.28); ctx.stroke();
      }
      prism.drawText(w.text, r.x + bs + t.gap, r.y + (r.h - sz) / 2, { size: sz, font: t.font, color: w.enabled ? t.text : t.dim });
    } else if (type === "slider") {
      var hasTop = w.text || w.showValue, ty = r.y + (hasTop ? r.h - sz * 0.7 : r.h / 2), kr = sz * 0.5;
      var n = (w.value - w.min) / ((w.max - w.min) || 1);
      if (hasTop) {
        if (w.text) prism.drawText(w.text, r.x, r.y, { size: sz, font: t.font, color: t.text });
        if (w.showValue) prism.drawText(String(Math.round(w.value * 100) / 100), r.x + r.w, r.y, { size: sz, font: t.font, color: t.dim, align: "right" });
      }
      box(ctx, { x: r.x + kr, y: ty - 3, w: r.w - kr * 2, h: 6 }, t.track, null, 3);
      box(ctx, { x: r.x + kr, y: ty - 3, w: (r.w - kr * 2) * n, h: 6 }, w.enabled ? t.accent : t.dim, null, 3);
      ctx.fillStyle = w.enabled ? (active ? t.accent : "#fff") : t.dim;
      ctx.beginPath(); ctx.arc(r.x + kr + (r.w - kr * 2) * n, ty, kr * (active ? 1.15 : 1), 0, Math.PI * 2); ctx.fill();
    } else if (type === "bar") {
      var frac = prism.clamp((w._disp - w.min) / ((w.max - w.min) || 1), 0, 1);
      box(ctx, r, t.track, t.border, Math.min(radius, r.h / 2), t.borderWidth);
      if (frac > 0) {
        ctx.save();
        path(ctx, r.x, r.y, r.w, r.h, Math.min(radius, r.h / 2)); ctx.clip();
        ctx.fillStyle = w.color || t.accent;
        ctx.fillRect(r.x, r.y, r.w * frac, r.h);
        ctx.restore();
      }
      if (w.text) prism.drawText(w.text, r.x + r.w / 2, r.y + (r.h - sz * 0.8) / 2, { size: sz * 0.8, font: t.font, color: t.text, align: "center", outline: true });
    } else if (type === "input") {
      var focused = ui.focus === w;
      box(ctx, r, w.enabled ? t.track : t.disabled, focused ? t.accent : t.border, radius, focused ? 2 : t.borderWidth);
      var shownText = w.password ? new Array(w.value.length + 1).join("*") : w.value;
      var empty = !shownText;
      var label = empty ? (w.placeholder || "") : shownText;
      ctx.save();
      ctx.beginPath(); ctx.rect(r.x + 4, r.y, r.w - 8, r.h); ctx.clip();
      var tw = textW(w, label), off = Math.max(0, tw - (r.w - 16));
      prism.drawText(label, r.x + 8 - off, r.y + (r.h - sz) / 2, { size: sz, font: t.font, color: empty ? t.dim : t.text });
      if (focused && Math.floor(performance.now() / 500) % 2 === 0) {
        ctx.fillStyle = t.text;
        ctx.fillRect(r.x + 8 - off + (empty ? 0 : tw) + 1, r.y + r.h * 0.2, 2, r.h * 0.6);
      }
      ctx.restore();
    } else if (type === "image") {
      prism.drawImg(w.image, r.x, r.y, r.w, r.h);
    }

    if (ui.nav && ui.focus === w && type !== "input") {
      box(ctx, { x: r.x - 2, y: r.y - 2, w: r.w + 4, h: r.h + 4 }, null, t.accent, radius + 2, 2);
    }
  }

  function drawToasts(ctx) {
    var t = ui.theme, sz = t.size, y = prism.height - 16;
    for (var i = ui.toasts.length - 1; i >= 0; i--) {
      var o = ui.toasts[i], fade = Math.min(1, o.age * 5, (o.life - o.age) * 3);
      var w = prism.measureText(o.text, sz, t.font) + sz * 2, h = sz * 2.2;
      y -= h;
      ctx.globalAlpha = Math.max(0, fade);
      box(ctx, { x: (prism.width - w) / 2, y: y + (1 - fade) * 10, w: w, h: h }, o.color || t.panel, t.border, t.radius, t.borderWidth);
      prism.drawText(o.text, prism.width / 2, y + (1 - fade) * 10 + (h - sz) / 2, { size: sz, font: t.font, color: t.text, align: "center" });
      y -= 6;
    }
  }

  function drawTip(ctx) {
    var w = ui.hot;
    if (!w || !w.tip || hoverTime < 0.45) return;
    var t = ui.theme, sz = t.size - 2, m = prism._mouse;
    var tw = prism.measureText(w.tip, sz, t.font) + 12, th = sz + 10;
    var x = prism.clamp(m.x + 12, 2, prism.width - tw - 2), y = prism.clamp(m.y + 18, 2, prism.height - th - 2);
    ctx.globalAlpha = 0.95;
    box(ctx, { x: x, y: y, w: tw, h: th }, t.tipBg, null, Math.min(4, t.radius));
    prism.drawText(w.tip, x + 6, y + 5, { size: sz, font: t.font, color: t.tipText });
  }

  ui._draw = function () {
    if (!prism.ctx) return;
    var ctx = prism.ctx, dpr = prism._quality === "master" ? prism._dpr : 1;
    var order = ui._order || [];
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.lineCap = "butt";
    for (var i = 0; i < order.length; i++) drawWidget(ctx, order[i]);
    drawToasts(ctx);
    drawTip(ctx);
    ctx.restore();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", function (e) {
      var f = ui.focus;
      if (!f || f.type !== "input" || !f.enabled) return;
      var v = f.value, max = f.maxLength || 9999;
      if (e.key === "Backspace") { f.setValue(v.slice(0, -1)); }
      else if (e.key === "Enter") { f.emit("submit", v); ui.blur(); }
      else if (e.key === "Escape") { ui.blur(); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && v.length < max) {
        if (f.pattern && !new RegExp(f.pattern).test(e.key)) return;
        f.setValue(v + e.key);
      } else if (e.key === "Tab") return;
      e.preventDefault();
    });
  }

  ["key", "keyHit", "keyUp"].forEach(function (name) {
    var orig = prism[name];
    prism[name] = function (k) { return ui.typing ? false : orig(k); };
  });

  var baseSync = prism._syncInput;
  prism._syncInput = function () {
    baseSync();
    ui._process();
  };

  var baseClear = prism._clearFrameInput;
  prism._clearFrameInput = function () {
    ui._draw();
    baseClear();
  };

})(typeof window !== "undefined" ? window : this);

(function (global) {

  var prism = global.prism;

  prism.plugins = prism._plugins;

  prism.use = function (plugin, opts) {
    var name = plugin && plugin.name;
    var install = typeof plugin === "function" ? plugin : plugin && plugin.install;
    if (typeof install !== "function") return prism;
    if (name && prism._plugins[name]) return prism;
    if (name) prism._plugins[name] = plugin;
    install(prism, opts || {});
    return prism;
  };

  prism.has = function (name) { return !!prism._plugins[name]; };

  prism.extend = function (name, value, force) {
    if (typeof name === "object") {
      for (var k in name) prism.extend(k, name[k], value);
      return prism;
    }
    if (prism[name] !== undefined && !force) {
      console.warn("Prism2D: '" + name + "' already exists, pass force to overwrite");
      return prism;
    }
    prism[name] = value;
    return prism;
  };

  prism.emit = function (event, arg) { prism._emit(event, arg); return prism; };

  prism.once = function (event, fn) {
    function wrap(a) { prism.off(event, wrap); fn(a); }
    return prism.on(event, wrap);
  };

  prism.pause = function () {
    if (!prism._paused) { prism._paused = true; prism._emit("pause"); }
    return prism;
  };

  prism.resume = function () {
    if (prism._paused) { prism._paused = false; prism._lastTime = performance.now(); prism._emit("resume"); }
    return prism;
  };

  prism.togglePause = function () { return prism._paused ? prism.resume() : prism.pause(); };
  prism.isPaused = function () { return prism._paused; };

  prism.timeScale = function (s) {
    if (s === undefined) return prism._timeScale;
    prism._timeScale = Math.max(0, s);
    return prism;
  };

  prism.fps = function (n) {
    prism._timestep = 1000 / prism.clamp(n || 60, 1, 1000);
    return prism;
  };

  prism.config = function (o) {
    o = o || {};
    if (o.width || o.height) prism.size(o.width || prism.width, o.height || prism.height);
    if (o.background) prism.bg(o.background);
    if (o.mode) prism.mode(o.mode);
    if (o.quality) prism.quality(o.quality);
    if (o.scaleMode) prism.scaleMode(o.scaleMode);
    if (o.fps) prism.fps(o.fps);
    if (o.gravity) prism.gravity(o.gravity.x || 0, o.gravity.y || 0);
    if (o.interpolate !== undefined) prism.interpolate(o.interpolate);
    if (o.timeScale !== undefined) prism.timeScale(o.timeScale);
    if (o.volume !== undefined) prism.volume(o.volume);
    if (o.debug !== undefined) prism.debug(o.debug);
    return prism;
  };

  prism.volume = function (v) {
    if (v === undefined) return prism._masterVol;
    prism._masterVol = prism.clamp(v, 0, 1);
    return prism;
  };

  var clocks = [], clockId = 1;

  prism.after = function (sec, fn) {
    var id = clockId++;
    clocks.push({ id: id, left: sec, every: 0, times: 1, fn: fn });
    return id;
  };

  prism.every = function (sec, fn, times) {
    var id = clockId++;
    clocks.push({ id: id, left: sec, every: sec, times: times || Infinity, fn: fn });
    return id;
  };

  prism.cancel = function (id) {
    for (var i = 0; i < clocks.length; i++) {
      if (clocks[i].id === id) { clocks.splice(i, 1); return true; }
    }
    return false;
  };

  prism.cancelAll = function () { clocks.length = 0; return prism; };

  var E = prism.ease = {
    linear: function (t) { return t; },
    quadIn: function (t) { return t * t; },
    quadOut: function (t) { return t * (2 - t); },
    quadInOut: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    cubicIn: function (t) { return t * t * t; },
    cubicOut: function (t) { var u = t - 1; return u * u * u + 1; },
    cubicInOut: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    sineInOut: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    backOut: function (t) { var c = 1.70158, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; },
    elasticOut: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    },
    bounceOut: function (t) {
      var n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
      if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
      t -= 2.625 / d; return n * t * t + 0.984375;
    }
  };

  var tweens = [];

  prism.tween = function (target, props, duration, opts) {
    opts = opts || {};
    var tw = {
      target: target, props: props, dur: Math.max(0.0001, duration || 1),
      delay: opts.delay || 0, t: 0, dir: 1, from: null, loops: opts.loop === true ? Infinity : (opts.loop || 0),
      yoyo: !!opts.yoyo, ease: typeof opts.ease === "function" ? opts.ease : (E[opts.ease] || E.quadOut),
      onUpdate: opts.onUpdate, onDone: opts.onDone, dead: false,
      stop: function () { tw.dead = true; return tw; }
    };
    tweens.push(tw);
    return tw;
  };

  prism.killTweens = function (target) {
    for (var i = 0; i < tweens.length; i++) {
      if (!target || tweens[i].target === target) tweens[i].dead = true;
    }
    return prism;
  };

  function stepTween(tw, dt) {
    if (tw.delay > 0) { tw.delay -= dt; return; }
    if (!tw.from) {
      tw.from = {};
      for (var k in tw.props) tw.from[k] = tw.target[k];
    }
    tw.t += dt * tw.dir;
    var done = false;
    if (tw.t >= tw.dur) { tw.t = tw.dur; done = true; }
    if (tw.t <= 0) { tw.t = 0; done = true; }
    var p = tw.ease(tw.t / tw.dur);
    for (var key in tw.props) tw.target[key] = tw.from[key] + (tw.props[key] - tw.from[key]) * p;
    if (tw.onUpdate) tw.onUpdate(tw.target, p);
    if (!done) return;
    if (tw.yoyo && tw.dir === 1) { tw.dir = -1; return; }
    if (tw.loops > 0) { tw.loops--; tw.dir = 1; tw.t = 0; return; }
    tw.dead = true;
    if (tw.onDone) tw.onDone(tw.target);
  }

  var baseTick = prism._tickTimers;
  prism._tickTimers = function (dt) {
    baseTick(dt);
    var i, c;
    for (i = clocks.length - 1; i >= 0; i--) {
      c = clocks[i];
      if (!c) continue;
      c.left -= dt;
      if (c.left > 0) continue;
      c.times--;
      if (c.times <= 0) clocks.splice(clocks.indexOf(c), 1);
      else c.left += c.every;
      c.fn();
    }
    for (i = tweens.length - 1; i >= 0; i--) {
      if (tweens[i].dead) tweens.splice(i, 1);
      else stepTween(tweens[i], dt);
    }
  };

  var rng = Math.random;

  prism.seed = function (n) {
    if (n === undefined) { rng = Math.random; return prism; }
    var a = n >>> 0;
    rng = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return prism;
  };

  prism.random = function () { return rng(); };

  prism.rand = function (min, max) {
    if (max === undefined) { max = min; min = 0; }
    return Math.floor(rng() * (max - min + 1)) + min;
  };

  prism.randf = function (min, max) { return rng() * (max - min) + min; };
  prism.chance = function (p) { return rng() < (p === undefined ? 0.5 : p); };
  prism.pick = function (list) { return list.length ? list[Math.floor(rng() * list.length)] : undefined; };

  prism.shuffle = function (list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = list[i];
      list[i] = list[j]; list[j] = t;
    }
    return list;
  };

  prism.map = function (v, a, b, c, d) { return c + (v - a) * (d - c) / (b - a || 1); };
  prism.approach = function (v, target, step) { return v < target ? Math.min(v + step, target) : Math.max(v - step, target); };
  prism.wrap = function (v, min, max) { var r = max - min; return ((v - min) % r + r) % r + min; };

  var mem = {};

  prism.store = {
    prefix: "prism:",
    set: function (key, value) {
      var raw = JSON.stringify(value);
      mem[key] = raw;
      try { localStorage.setItem(prism.store.prefix + key, raw); } catch (e) {}
      return prism;
    },
    get: function (key, fallback) {
      var raw = mem[key];
      try {
        var saved = localStorage.getItem(prism.store.prefix + key);
        if (saved !== null) raw = saved;
      } catch (e) {}
      if (raw === undefined) return fallback;
      try { return JSON.parse(raw); } catch (e) { return fallback; }
    },
    remove: function (key) {
      delete mem[key];
      try { localStorage.removeItem(prism.store.prefix + key); } catch (e) {}
      return prism;
    }
  };

  prism.pool = function (create, reset) {
    var p = {
      active: [], free: [],
      get: function () {
        var o = p.free.length ? p.free.pop() : create();
        if (reset) reset.apply(null, [o].concat([].slice.call(arguments)));
        p.active.push(o);
        return o;
      },
      release: function (o) {
        var i = p.active.indexOf(o);
        if (i < 0) return p;
        p.active.splice(i, 1);
        p.free.push(o);
        return p;
      },
      each: function (fn) {
        for (var i = p.active.length - 1; i >= 0; i--) fn(p.active[i], i);
        return p;
      },
      clear: function () { p.free = p.free.concat(p.active); p.active = []; return p; }
    };
    return p;
  };

  var binds = {}, padNow = [], padPrev = [], padAxes = [];

  prism.bind = function (name, inputs) {
    binds[name] = [].concat(inputs);
    return prism;
  };

  prism.unbind = function (name) { delete binds[name]; return prism; };

  function padIndex(token) {
    var m = /^pad:(\d+)$/.exec(token);
    return m ? +m[1] : -1;
  }

  function actionAny(name, keyFn, padFn) {
    var list = binds[name] || [];
    for (var i = 0; i < list.length; i++) {
      var pi = padIndex(list[i]);
      if (pi >= 0 ? padFn(pi) : (list[i] === "mouse" ? mouseFn(keyFn) : keyFn(list[i]))) return true;
    }
    return false;
  }

  function mouseFn(keyFn) {
    if (keyFn === prism.key) return prism._mouse.down;
    if (keyFn === prism.keyHit) return prism._mouse.justPressed;
    return prism._mouse.justReleased;
  }

  prism.action = function (name) {
    return actionAny(name, prism.key, function (i) { return !!padNow[i]; });
  };
  prism.actionHit = function (name) {
    return actionAny(name, prism.keyHit, function (i) { return !!padNow[i] && !padPrev[i]; });
  };
  prism.actionUp = function (name) {
    return actionAny(name, prism.keyUp, function (i) { return !padNow[i] && !!padPrev[i]; });
  };

  prism.pad = {
    connected: function () { return padAxes.length > 0; },
    axis: function (i) { var v = padAxes[i] || 0; return Math.abs(v) < 0.15 ? 0 : v; },
    button: function (i) { return !!padNow[i]; },
    hit: function (i) { return !!padNow[i] && !padPrev[i]; }
  };

  var baseSync = prism._syncInput;
  prism._syncInput = function () {
    baseSync();
    padPrev = padNow;
    padNow = [];
    padAxes = [];
    var list = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var g = 0; g < list.length; g++) {
      var pad = list[g];
      if (!pad) continue;
      for (var b = 0; b < pad.buttons.length; b++) padNow[b] = padNow[b] || pad.buttons[b].pressed;
      padAxes = pad.axes.slice();
      break;
    }
  };

  var dbg = null, frames = 0, fpsClock = 0, fpsShown = 0;

  prism.debug = function (opts) {
    dbg = opts ? (opts === true ? {} : opts) : null;
    return prism;
  };

  function drawDebug() {
    var now = performance.now();
    frames++;
    if (now - fpsClock >= 500) { fpsShown = Math.round(frames * 1000 / (now - fpsClock)); frames = 0; fpsClock = now; }
    if (!dbg) return;
    var ctx = prism.ctx;
    var dpr = prism._quality === "master" ? prism._dpr : 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    if (dbg.boxes) {
      var cam = prism._activeCamera;
      if (cam) prism.beginCamera(cam);
      for (var i = 0; i < prism._bodies.length; i++) {
        var b = prism._bodies[i];
        prism.drawRectLine(b.x, b.y, b.w, b.h, b.sensor ? "#ff0" : (b.grounded ? "#0f0" : "#f0f"), 1);
      }
      if (cam) prism.endCamera();
    }
    var lines = [
      fpsShown + " fps  " + prism.width + "x" + prism.height,
      "bodies " + prism._bodies.length + "  particles " + prism._particles.length,
      "scene " + (prism._currentScene ? prism._currentScene.name : "-") + (prism._paused ? "  [paused]" : "")
    ];
    prism.drawRect(4, 4, 230, lines.length * 14 + 6, "rgba(0,0,0,0.6)");
    for (var l = 0; l < lines.length; l++) {
      prism.drawText(lines[l], 8, 7 + l * 14, { size: 11, font: "monospace", color: "#8f8" });
    }
    ctx.restore();
  }

  var baseClear = prism._clearFrameInput;
  prism._clearFrameInput = function () {
    baseClear();
    drawDebug();
  };

  prism.fullscreen = function (on) {
    var el = prism.canvas && prism.canvas.parentElement || document.documentElement;
    if (on === false || (on === undefined && document.fullscreenElement)) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(function () {});
    }
    return prism;
  };

  prism.screenshot = function (type) { return prism.canvas.toDataURL(type || "image/png"); };

})(typeof window !== "undefined" ? window : this);
