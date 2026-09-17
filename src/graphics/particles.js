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
