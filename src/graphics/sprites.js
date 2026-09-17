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
