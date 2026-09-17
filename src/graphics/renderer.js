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
