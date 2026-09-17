(function (global) {

  var prism = function (w, h, parent) {
    return prism.init({ width: w, height: h, parent: parent });
  };

  prism.version = "1.0.0rc.1";
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
  prism._particles = [];

  global.prism = prism;

})(typeof window !== "undefined" ? window : this);
