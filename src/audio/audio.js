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
