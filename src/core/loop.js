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
