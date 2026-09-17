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
