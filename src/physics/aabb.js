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
