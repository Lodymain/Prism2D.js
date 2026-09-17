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
