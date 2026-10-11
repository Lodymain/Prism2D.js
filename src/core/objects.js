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
