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
