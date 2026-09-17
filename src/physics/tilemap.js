(function (global) {

  var prism = global.prism;

  prism.tilemap = function (image, tileW, tileH) {
    var map = {
      image: image || "",
      x: 0, y: 0,
      tileWidth: tileW || 32,
      tileHeight: tileH || 32,
      cols: 0, rows: 0,
      tilesetCols: 1,
      data: [],
      collisionTiles: [],
      solidTile: -1,
      visible: true,
      tag: "",

      at: function (x, y) { map.x = x; map.y = y; return map; },
      grid: function (data) {
        map.data = data;
        map.rows = data.length;
        map.cols = (data[0] && data[0].length) ? data[0].length : 0;
        return map;
      },
      tileset: function (cols) { map.tilesetCols = cols; return map; },
      solids: function (arr) { map.collisionTiles = arr; return map; },
      get: function (c, r) { return prism.getTile(map, c, r); },
      set: function (c, r, v) { prism.setTile(map, c, r, v); return map; },
      draw: function (cam) { prism.drawTilemap(map, cam === undefined ? prism._activeCamera : cam); return map; },
      hits: function (obj) { return prism.collideTilemap(obj, map); },
      solve: function (obj) { return prism.solveTilemap(obj, map); },
      ray: function (x, y, dx, dy, maxDist) { return prism.tilemapRay(map, x, y, dx, dy, maxDist); },
      worldWidth: function () { return map.cols * map.tileWidth; },
      worldHeight: function () { return map.rows * map.tileHeight; }
    };
    return map;
  };

  prism.getTile = function (map, c, r) {
    if (r < 0 || r >= map.rows || c < 0 || c >= map.cols) return -1;
    var row = map.data[r];
    if (!row) return -1;
    var v = row[c];
    if (v === undefined || v === null) return -1;
    return v;
  };

  prism.setTile = function (map, c, r, v) {
    if (r < 0 || r >= map.rows || c < 0 || c >= map.cols) return;
    if (!map.data[r]) return;
    map.data[r][c] = v;
  };

  prism.tileAt = function (map, wx, wy) {
    var c = Math.floor((wx - map.x) / map.tileWidth);
    var r = Math.floor((wy - map.y) / map.tileHeight);
    return { col: c, row: r, value: prism.getTile(map, c, r) };
  };

  prism.isSolid = function (map, v) {
    if (v === -1 || v === undefined || v === null) return false;
    if (map.collisionTiles && map.collisionTiles.length > 0) {
      for (var i = 0; i < map.collisionTiles.length; i++) {
        if (map.collisionTiles[i] === v) return true;
      }
      return false;
    }
    return v > map.solidTile;
  };

  prism.drawTilemap = function (map, cam) {
    if (!map || !map.visible) return;
    var img = (typeof map.image === "object" && map.image !== null) ? map.image : prism._images[map.image];
    if (!img) return;

    var ctx = prism.ctx;
    var tw = map.tileWidth, th = map.tileHeight;
    var sc = 0, ec = map.cols, sr = 0, er = map.rows;

    if (cam) {
      var hw = (prism.width * 0.5) / cam.zoom;
      var hh = (prism.height * 0.5) / cam.zoom;
      var cx = cam.x - cam.offsetX / cam.zoom;
      var cy = cam.y - cam.offsetY / cam.zoom;
      sc = Math.floor((cx - hw - map.x) / tw) - 1;
      ec = Math.ceil((cx + hw - map.x) / tw) + 1;
      sr = Math.floor((cy - hh - map.y) / th) - 1;
      er = Math.ceil((cy + hh - map.y) / th) + 1;
      if (sc < 0) sc = 0;
      if (sr < 0) sr = 0;
      if (ec > map.cols) ec = map.cols;
      if (er > map.rows) er = map.rows;
    }

    for (var r = sr; r < er; r++) {
      var row = map.data[r];
      if (!row) continue;
      for (var c = sc; c < ec; c++) {
        var t = row[c];
        if (t === -1 || t === undefined || t === null) continue;
        var sx = (t % map.tilesetCols) * tw;
        var sy = Math.floor(t / map.tilesetCols) * th;
        ctx.drawImage(img, sx, sy, tw, th, prism.snap(map.x + c * tw), prism.snap(map.y + r * th), tw, th);
      }
    }
  };

  prism.collideTilemap = function (obj, map) {
    if (!map) return null;
    var aw = obj.w || 0, ah = obj.h || 0;
    var lc = Math.floor((obj.x - map.x) / map.tileWidth);
    var rc = Math.floor((obj.x + aw - 0.001 - map.x) / map.tileWidth);
    var tr = Math.floor((obj.y - map.y) / map.tileHeight);
    var br = Math.floor((obj.y + ah - 0.001 - map.y) / map.tileHeight);

    var hits = [];
    for (var r = tr; r <= br; r++) {
      for (var c = lc; c <= rc; c++) {
        var t = prism.getTile(map, c, r);
        if (prism.isSolid(map, t)) {
          hits.push({
            col: c, row: r, value: t,
            x: map.x + c * map.tileWidth,
            y: map.y + r * map.tileHeight,
            w: map.tileWidth, h: map.tileHeight
          });
        }
      }
    }
    return hits.length > 0 ? hits : null;
  };

  prism.solveTilemap = function (obj, map) {
    var hits = prism.collideTilemap(obj, map);
    if (!hits) return null;

    hits.sort(function (a, b) {
      var oa = prism.overlap(obj, a);
      var ob = prism.overlap(obj, b);
      return (ob ? ob.area : 0) - (oa ? oa.area : 0);
    });

    var sides = [];
    for (var i = 0; i < hits.length; i++) {
      if (prism.collide(obj, hits[i])) {
        var s = prism.solve(obj, hits[i]);
        if (s) sides.push(s);
      }
    }
    return sides.length > 0 ? sides : null;
  };

  prism.tilemapRay = function (map, x, y, dx, dy, maxDist) {
    maxDist = maxDist || 1000;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    var stepX = dx >= 0 ? 1 : -1;
    var stepY = dy >= 0 ? 1 : -1;
    var tx = Math.floor((x - map.x) / map.tileWidth);
    var ty = Math.floor((y - map.y) / map.tileHeight);
    var absDx = Math.abs(dx) || 0.000001;
    var absDy = Math.abs(dy) || 0.000001;
    var tDeltaX = map.tileWidth / absDx;
    var tDeltaY = map.tileHeight / absDy;
    var nextX = map.x + (tx + (stepX > 0 ? 1 : 0)) * map.tileWidth;
    var nextY = map.y + (ty + (stepY > 0 ? 1 : 0)) * map.tileHeight;
    var tMaxX = Math.abs((nextX - x) / absDx);
    var tMaxY = Math.abs((nextY - y) / absDy);
    var dist = 0;
    var iterations = 0;

    while (dist < maxDist && iterations < 1000) {
      var v = prism.getTile(map, tx, ty);
      if (prism.isSolid(map, v)) {
        return { col: tx, row: ty, value: v, dist: dist, x: x + dx * dist, y: y + dy * dist };
      }
      if (tMaxX < tMaxY) { tx += stepX; dist = tMaxX; tMaxX += tDeltaX; }
      else { ty += stepY; dist = tMaxY; tMaxY += tDeltaY; }
      iterations++;
    }
    return null;
  };

})(typeof window !== "undefined" ? window : this);
