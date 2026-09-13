


# Prism2D.js

<p align="center">
  <strong>Brutally minimal 2D game engine for the browser.</strong>
  <br>
  Zero boilerplate. Absolute control. One file. No dependencies.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> |
  <a href="#installation">Installation</a> |
  <a href="#documentation">Documentation</a> |
  <a href="#examples">Examples</a> |
  <a href="#api-reference">API Reference</a>
</p>

<br>

| | |
|---|---|
| **Version** | 1.0.0rc.1 |
| **License** | MIT |
| **Started** | December 06, 2024 |
| **Released** | September 13, 2026 |
| **Engine** | HTML5 Canvas 2D |
| **Size** | ~59.42KB (unminified) |
| **Dependencies** | None |

<br>

## Author and Team

| **Creator and Lead** | `Lodymain` |

**Contributors**


| [@Lodymain] | [engine,renderer,camera ,collision ,] |

| [@ByteLands] | [documentation, input, Test the project,Tilemaps] |

| [@kavdemo] | [scenes,renderer sprites,] |

Want to contribute? Read the [Contributing](#contributing) section at the bottom of this document.

<br>

## CDN and Download

**CDN**

```html
<script src="https://cdn.jsdelivr.net/gh/Lodymain/Prism2D.js@main/build/prims2d.min.js"></script>
```

**Direct Download**

Download `prism2d.min.js` from the [Releases] https://github.com/Lodymain/Prism2D.js/releases page and include it in your project.

```html
<script src="prism2d.min.js"></script>
```

**npm (coming soon)**

```
npm install prism2d
```

<br>

## What is Prism2D

Prism2D is a complete 2D game engine that runs entirely in the browser using the HTML5 Canvas API. It was built from December 2024 to September 2026 with a single mission: eliminate every piece of unnecessary complexity from 2D game development while keeping the programmer in full control.

Most game engines force you to learn a complex class hierarchy, manage scene trees, configure dozens of JSON files, and write hundreds of lines before a single pixel appears on screen. Prism2D rejects all of that. Every game object is a plain JavaScript object. Every method returns itself for chaining. There are no classes, no inheritance, no prototype chains. You call a function, you get an object, you start making your game.

At the same time, Prism2D never locks you out. The raw canvas context is always available at `prism.ctx`. You can mix engine calls with native Canvas API calls freely. You can bypass the game loop, ignore the physics system, skip the scene manager. The engine is a toolbox, not a cage.

<br>

## What is Included in Version 1.0.0rc.1

This release candidate contains every system needed to build complete 2D games.

**Core Engine**
- Fixed timestep game loop at 60 updates per second
- Accumulator with 200ms safety cap to prevent spiral of death
- Render interpolation for smooth visuals independent of physics rate
- Automatic screen clearing with configurable background
- Global hooks system for update, draw, resize, and init events
- Timer system with delayed callbacks

**Rendering**
- Two rendering modes: pixel (sharp pixel art) and smooth (HD artwork)
- Two quality levels: canvas (standard) and master (retina-aware, high DPI)
- Automatic scaling with fit, fill, stretch, and none modes
- Integer scaling for pixel-perfect upscaling in pixel mode
- Device pixel ratio support for retina displays in master quality
- Gradient rectangles, rounded rectangles, arcs
- Shadow and blur system
- Blend mode control
- Text with outline support and measurement
- Canvas transform helpers with push/pop state management

**Game Objects**
- Rectangle, circle, and sprite factories
- Fluent chaining API on every method
- Position, velocity, size, rotation, flip, scale
- Color, visibility, freeze, kill
- Movement helpers: axis-normalized, directional, chase, look-at, move-toward
- Jump with automatic coyote time
- Dash, impulse, force
- Kinematic bodies (velocity without gravity)
- Edge accessors: left, right, top, bottom, center

**Sprites and Images**
- Single and batch image loading with callbacks
- Animated spritesheet support with configurable frame size, count, speed, and rows
- Automatic frame advancement with tick
- Row switching with automatic reset

**Physics**
- Global gravity with per-object gravity scale
- Friction with frame-rate independent clamping
- Velocity capping on both axes
- Bounce coefficient on collision
- Freeze and unfreeze for pausing individual objects
- Coyote time tracking (0.1 second grace period after leaving a ledge)
- Grounded flag with previous-frame tracking

**Collision Detection**
- AABB rectangle vs rectangle
- Circle vs circle
- Circle vs rectangle
- Overlap area calculation
- Point-in-rectangle test
- Point-in-circle test

**Collision Resolution**
- Axis-separated push-out with velocity correction
- Bounce reflection on both axes
- One-way platforms (pass through from below, land from above)
- Sensor/trigger objects (detect without pushing)
- Group-based resolution against tagged collections
- Swept AABB for fast-moving objects (anti-tunneling)
- Tilemap collision with ghost-collision prevention via overlap sorting

**Collision Callbacks**
- onEnter: fires on first frame of contact
- onStay: fires every frame during overlap
- onLeave: fires when objects separate
- onHit: alias for onEnter
- Contact pair tracking with automatic cleanup

**Raycasting**
- Ray against array of objects
- Ray against tagged group
- Ray from game object center
- DDA tilemap raycasting with configurable max distance

**Tilemap**
- Grid-based world definition with 2D arrays
- Configurable tileset with column count
- Solid tile marking by list or threshold
- Camera-aware culling (only draws visible tiles)
- Tile read/write at grid or world coordinates
- World size helpers

**Camera**
- Smooth follow with separate X and Y lerp values
- Axis locking (follow only X, only Y, or both)
- Deadzone rectangle
- Look-ahead offset (lead)
- Screen offset
- World bounds clamping with small-world centering
- Shake with intensity and duration
- Zoom and rotation
- Snap to target (skip initial animation)
- Scope function for clean world/UI separation
- Screen-to-world and world-to-screen coordinate conversion

**Scenes**
- Named scene creation with fluent API
- Enter, leave, update, draw hooks per scene
- Key-value data storage per scene
- Clean transitions with automatic event firing

**Input**
- Keyboard: held, just pressed, just released
- Axis helpers combining arrows and WASD
- Mouse: position, held, click, release
- Mouse world position (camera-adjusted)
- Touch: first touch mapped to mouse, multitouch array
- Touch device detection
- Automatic canvas coordinate correction for any scaling

**Utilities**
- Random integer and float generation
- Clamp, distance, angle, linear interpolation
- Pixel snapping based on rendering mode
- Text width measurement

<br>

## Quick Start

Create a file called `index.html` and paste this code. Open it in any modern browser.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Prism2D Game</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #000;
    }
  </style>
</head>
<body>
<script src="prism2d.min.js"></script>
<script>

prism(400, 300).bg("#222");

var box = prism.rect(170, 120, 40, 40).color("#ff0");

prism.loop({
  update: function (dt) {
    if (prism.key("ArrowRight")) box.moveX(150 * dt);
    if (prism.key("ArrowLeft"))  box.moveX(-150 * dt);
    if (prism.key("ArrowDown"))  box.moveY(150 * dt);
    if (prism.key("ArrowUp"))    box.moveY(-150 * dt);
  },
  draw: function () {
    box.draw();
  }
});

</script>
</body>
</html>
```

A yellow square appears on screen. Use the arrow keys to move it. That is a complete Prism2D program.

<br>

## Installation

There are three ways to add Prism2D to your project.

**Option 1: Direct download (recommended)**

Download `prism2d.min.js` from the releases page. Place it next to your HTML file. Include it with a script tag before your game code.

```html
<script src="prism2d.min.js"></script>
<script src="game.js"></script>
```

This is the simplest approach. No build tools, no package managers, no configuration files.

**Option 2: CDN link**

Include the engine directly from a hosted URL. Replace the placeholder with the actual CDN address.

```html
<script src="https://cdn.jsdelivr.net/gh/Lodymain/Prism2D.js@main/build/prims2d.min.js"></script>
```

**Option 3: Source files (for engine development)**

If you want to read, modify, or contribute to the engine source code, the project is organized into modules. Include them in this exact order.

```html
<script src="src/index.js"></script>
<script src="src/core/engine.js"></script>
<script src="src/core/scenes.js"></script>
<script src="src/input/input.js"></script>
<script src="src/graphics/renderer.js"></script>
<script src="src/graphics/sprites.js"></script>
<script src="src/physics/aabb.js"></script>
<script src="src/physics/tilemap.js"></script>
<script src="src/camera/camera.js"></script>
```

The order matters because each file extends the `prism` object created by the previous files.

<br>

## Documentation

This section covers every feature in detail with explanations and code samples. Read it from top to bottom and you will understand the entire engine.

### Initializing the Engine

The simplest way to start is calling `prism` as a function.

```html
<script>
prism(800, 600);
</script>
```

This creates a canvas element that is 800 pixels wide and 600 pixels tall. The canvas is automatically appended to the document body.

You can specify a parent element by passing its ID as the third argument.

```html
<div id="game-container"></div>
<script>
prism(800, 600, "game-container");
</script>
```

For more control, use `prism.init()` with a configuration object.

```javascript
prism.init({
  width: 800,
  height: 600,
  parent: "game-container",
  background: "#111",
  mode: "pixel",
  quality: "master"
});
```

After initialization, the canvas and its 2D context are available as `prism.canvas` and `prism.ctx`. You can use them at any time for raw Canvas API calls.

### Rendering Modes

Prism2D offers two rendering modes that control how graphics appear on screen.

**Pixel mode** is designed for pixel art. Individual pixels stay sharp and blocky when the canvas is scaled up. There is no blurring, no smoothing. The engine uses CSS integer scaling so pixels are always perfect squares.

```javascript
prism(320, 180).mode("pixel");
```

Use pixel mode for retro-style games, low-resolution artwork, and anything where you want that classic pixelated look.

**Smooth mode** enables image smoothing for clean edges on rotated or scaled artwork. It respects the device pixel ratio on high-DPI screens so text and lines look crisp on retina displays.

```javascript
prism(800, 600).mode("smooth");
```

Use smooth mode for games with detailed illustrations, vector-style graphics, or modern HD artwork.

### Quality Levels

On top of the rendering mode, Prism2D offers two quality levels that control the internal resolution of the canvas.

**Canvas quality** is the standard level. The canvas resolution matches the logical resolution exactly. In pixel mode, a 320x180 game creates a 320x180 canvas. This is the fastest option and perfectly adequate for most games.

```javascript
prism(320, 180).mode("pixel").quality("canvas");
```

**Master quality** uses the device pixel ratio to create a higher-resolution internal canvas. On a retina screen with a 2x DPR, a 800x600 game creates a 1600x1200 canvas that is displayed at 800x600 CSS size. This makes everything sharper, especially text, UI elements, and smooth-mode artwork. In pixel mode with master quality, sprites remain pixel-perfect but UI and text benefit from the higher resolution.

```javascript
prism(800, 600).mode("smooth").quality("master");
```

The quality setting can be changed at any time.

```javascript
prism.quality("master");
prism.quality("canvas");
```

### Scale Modes

Scale modes control how the canvas fits into the browser window.

```javascript
prism.scaleMode("fit");
```

| Mode | Behavior |
|---|---|
| `"fit"` | Maintains aspect ratio and fits within the available space. In pixel mode with canvas quality, uses integer scaling for perfect pixels. |
| `"fill"` | Fills the entire parent element, maintaining aspect ratio but potentially cropping edges. |
| `"stretch"` | Stretches to fill without maintaining aspect ratio. May distort the image. |
| `"none"` | Uses the exact pixel dimensions. No scaling applied. |

### The Game Loop

Every game needs a loop that runs continuously. Prism2D splits this into two distinct phases.

**Update** runs at a fixed rate of 60 times per second regardless of the actual frame rate. This is where game logic belongs: moving characters, checking collisions, handling input, updating scores. The fixed rate ensures consistent behavior on every device.

**Draw** runs once per frame at the browser's refresh rate (typically 60 fps via requestAnimationFrame). This is where rendering belongs: drawing sprites, shapes, text, and UI elements.

```javascript
prism.loop({
  init: function () {
    // runs once before the first frame
  },
  update: function (dt) {
    // runs 60 times per second
    // dt is approximately 0.0166 seconds
  },
  draw: function () {
    // runs every frame
  }
});
```

The `dt` parameter in the update function is the time step in seconds. It is always approximately 1/60 of a second. Multiply your speeds by `dt` for frame-rate independent movement.

The engine uses a fixed timestep accumulator. If the browser drops to 30 fps, the engine runs two update steps per frame to maintain consistent game speed. The accumulator has a 200ms safety cap: if a frame takes longer than 200ms (for example when the browser tab is in the background), excess time is discarded to prevent the engine from trying to run hundreds of catch-up steps.

Render interpolation smooths the visual position of physics objects between update steps. This prevents micro-stuttering when the draw rate does not perfectly align with the update rate. It is enabled by default and can be toggled.

```javascript
prism.interpolate(true);   // smooth (default)
prism.interpolate(false);  // raw positions
```

The screen is automatically cleared before each draw call. To disable this for trail effects or paint programs, set `autoClear` to false.

```javascript
prism.loop({
  autoClear: false,
  draw: function () {
    // previous frame is still visible
  }
});
```

To stop the loop at any time, call `prism.stop()`.

**Global hooks** let you register update and draw functions from anywhere in your code, not just inside the loop configuration.

```javascript
prism.on("update", function (dt) { });
prism.on("draw", function () { });
prism.on("resize", function (info) { });
```

Remove a hook with `prism.off()`.

```javascript
function myFunc(dt) { }
prism.on("update", myFunc);
prism.off("update", myFunc);
```

### Drawing Shapes

Prism2D provides functions for drawing common shapes. All drawing functions return `prism` for chaining.

```javascript
// filled rectangle
prism.drawRect(100, 50, 64, 32, "#ff0");

// rectangle outline
prism.drawRectLine(100, 50, 64, 32, "#fff", 2);

// rounded rectangle
prism.drawRound(100, 50, 64, 32, 8, "#ff0");

// filled circle
prism.drawCircle(200, 150, 30, "#0f0");

// circle outline
prism.drawCircleLine(200, 150, 30, "#0f0", 2);

// arc
prism.drawArc(200, 150, 30, 0, Math.PI, "#f00", 2);

// line
prism.drawLine(0, 0, 400, 300, "#f00", 2);

// triangle
prism.drawTri(100, 200, 150, 100, 200, 200, "#f0f");

// polygon
prism.drawPoly([
  { x: 100, y: 50 },
  { x: 150, y: 30 },
  { x: 170, y: 80 }
], "#0ff");

// gradient rectangle (horizontal)
prism.drawGradRect(100, 100, 200, 50, "#f00", "#00f", false);

// gradient rectangle (vertical)
prism.drawGradRect(100, 100, 200, 50, "#f00", "#00f", true);
```

### Drawing Text

```javascript
prism.drawText("Hello World", 100, 50, {
  color: "#fff",
  size: 24,
  font: "Arial",
  align: "left",
  baseline: "top",
  bold: true,
  italic: false,
  outline: true,
  outlineColor: "#000",
  outlineWidth: 3
});
```

All options are optional. Defaults: white, 16px, Arial, left-aligned, top baseline, no bold, no italic, no outline.

Measure text width before drawing for alignment calculations.

```javascript
var width = prism.measureText("Hello", 24, "Arial");
```

### Shadows and Blend Modes

In master quality mode, shadows and blend modes produce high-quality visual effects.

```javascript
// enable shadow
prism.shadow("#000", 10, 2, 2);
prism.drawRect(100, 100, 50, 50, "#f00");
prism.noShadow();

// blend modes
prism.blend("lighter");    // additive blending (glow effects)
prism.drawCircle(200, 200, 40, "rgba(255,100,0,0.5)");
prism.blend("source-over"); // reset to normal
```

Available blend modes include `"source-over"` (default), `"lighter"` (additive), `"multiply"`, `"screen"`, `"overlay"`, `"darken"`, `"lighten"`, `"color-dodge"`, `"color-burn"`, and all other Canvas composite operations.

### Game Objects

Game objects are plain JavaScript objects created by factory functions. They have no hidden classes, no prototype chains, no inheritance. Every method returns the object itself for chaining.

**Creating objects**

```javascript
var player = prism.rect(100, 200, 24, 32);
var ball = prism.circle(200, 150, 12);
```

**Configuring with chaining**

```javascript
var player = prism.rect(100, 200, 24, 32)
  .color("#ff4757")
  .body()
  .tagged("player")
  .maxSpeed(250, 600)
  .fric(0.4);
```

**Object methods reference**

```javascript
obj.color("#f00")          // set fill color
obj.at(100, 200)           // set position (resets interpolation)
obj.size(48, 64)           // set width and height
obj.hide()                 // make invisible
obj.show()                 // make visible
obj.rot(0.5)               // set rotation in radians
obj.flip(true, false)      // flip horizontally
obj.scaleXY(2, 2)          // set scale
obj.draw()                 // render to screen
obj.kill()                 // hide and remove from physics
```

**Edge accessors**

```javascript
var l = obj.left();        // obj.x
var r = obj.right();       // obj.x + obj.w
var t = obj.top();         // obj.y
var b = obj.bottom();      // obj.y + obj.h
var cx = obj.centerX();    // obj.x + obj.w * 0.5
var cy = obj.centerY();    // obj.y + obj.h * 0.5
obj.setCenter(400, 300);   // position by center point
```

**Direct property access**

Game objects are plain objects. You can read and write properties directly.

```javascript
player.x = 50;
player.y = 100;
player.vx = 200;
var onGround = player.grounded;
```

### Moving Objects

Prism2D provides many movement methods for different game styles.

**Direct position changes**

```javascript
obj.move(5, -3);       // move by offset on both axes
obj.moveX(5);          // move only horizontally
obj.moveY(-3);         // move only vertically
```

Always multiply by `dt` for consistent speed.

```javascript
obj.moveX(200 * dt);
```

**Velocity-based movement**

Velocity is pixels per second. The physics system integrates velocity automatically.

```javascript
obj.vel(200, 0);       // set both velocities
obj.velX(200);         // set only horizontal
obj.velY(-400);        // set only vertical
obj.vel(200, null);    // set X, keep current Y
obj.stop();            // zero both
obj.stopX();           // zero horizontal only
obj.stopY();           // zero vertical only
```

**Force and impulse**

```javascript
obj.addForce(0, -100); // add to existing velocity
obj.impulse(0, -500);  // replace velocity
```

**Normalized 8-direction movement**

When pressing two directions simultaneously (like right and down), diagonal movement is faster than cardinal movement. `moveAxis` normalizes the direction so speed is consistent in all eight directions.

```javascript
obj.moveAxis(prism.axisX(), prism.axisY(), 180);
```

`prism.axisX()` returns -1, 0, or +1 based on left/right arrows or A/D keys. `prism.axisY()` returns -1, 0, or +1 based on up/down arrows or W/S keys.

**Angle-based movement**

```javascript
obj.moveDir(Math.PI / 4, 200);   // move at 45 degrees
obj.lookAt(targetX, targetY);     // rotate toward a point
obj.moveDir(obj.angle, 150);      // move where you are looking
```

**Chase and move toward**

```javascript
enemy.chase(player, 80);          // follow a target continuously
var arrived = obj.moveToward(tx, ty, 3);  // returns true at destination
```

### Input

**Keyboard**

```javascript
prism.key("ArrowLeft")     // true while held
prism.keyHit("Space")      // true on the frame it was pressed
prism.keyUp("Escape")      // true on the frame it was released
```

`prism.key()` accepts both `event.key` values (like `"ArrowLeft"`, `"a"`) and `event.code` values (like `"KeyA"`, `"Space"`).

**Axis helpers**

```javascript
var ix = prism.axisX();    // -1 (left/A), 0, or +1 (right/D)
var iy = prism.axisY();    // -1 (up/W), 0, or +1 (down/S)
```

**Mouse**

```javascript
prism.mouse.x()           // screen X
prism.mouse.y()           // screen Y
prism.mouse.down()         // button held
prism.mouse.hit()          // just clicked this frame
prism.mouse.up()           // just released this frame
prism.mouse.worldX()       // world X (camera-adjusted)
prism.mouse.worldY()       // world Y (camera-adjusted)
```

**Touch**

The first touch point is automatically mapped to the mouse. `prism.mouse.hit()` works as a tap on mobile.

```javascript
prism.isTouch()            // true if touch device
var t = prism.touches();   // array of { x, y, id }
```

### Gravity and Physics

```javascript
prism.gravity(0, 900);
```

The first argument is horizontal gravity (usually 0). The second is vertical. Values around 900 to 1400 create natural-feeling gravity.

**Enabling physics on an object**

```javascript
var player = prism.rect(100, 100, 24, 32).body();
```

Calling `.body()` registers the object in the physics system. It will be affected by gravity and its velocity will be integrated every update step.

**Kinematic objects** participate in physics (velocity is applied) but are not affected by gravity.

```javascript
var elevator = prism.rect(200, 400, 80, 16).kinematic();
elevator.velY(-30);
```

**Physics configuration**

```javascript
obj.gscale(0.5);          // half gravity
obj.gscale(0);            // no gravity (projectiles)
obj.fric(0.3);            // friction (slows horizontal movement)
obj.bouncy(0.8);          // bounce coefficient
obj.maxSpeed(250, 800);   // velocity caps
obj.freeze();             // pause physics
obj.unfreeze();           // resume physics
```

### Jumping

```javascript
var didJump = player.jump(430);
```

The `jump` method sets vertical velocity to -430 (upward). It only works if the player is grounded or within the coyote time window. Coyote time is a 0.1 second grace period after walking off a ledge where jumping is still allowed. This is built in automatically and makes platformer controls feel responsive.

The method returns `true` if the jump happened and `false` if it was blocked.

**Force jump (ignore ground check)**

```javascript
player.jump(400, false);
```

**Wall jump**

```javascript
player.jumpTo(200, -400);
```

**Dash**

```javascript
player.dash(1, 0, 500);    // dash right
player.dash(-1, 0, 500);   // dash left
player.dash(0, -1, 500);   // dash upward
```

### Collision Detection

```javascript
if (prism.collide(a, b)) { }
if (player.hits(enemy)) { }
```

The engine automatically selects the correct algorithm based on object types: AABB for rectangles, distance for circles, closest-point for circle vs rectangle.

**Overlap information**

```javascript
var info = prism.overlap(a, b);
if (info) {
  // info.x  - horizontal overlap
  // info.y  - vertical overlap
  // info.area - total area
}
```

**Point tests**

```javascript
prism.inRect(mx, my, button);
prism.inCircle(mx, my, ball);
```

### Collision Resolution

```javascript
var side = prism.solve(player, wall);
// side is "left", "right", "top", or "bottom"
```

Resolution pushes the moving object out of the solid object, zeroes velocity on the collision axis, applies bounce, and sets the grounded flag when appropriate.

**Group-based resolution**

```javascript
player.solveGroup("solid");
```

This tests and resolves collision against every object tagged `"solid"`. It returns an array of `{ side, target }` or null.

**One-way platforms**

```javascript
var plat = prism.rect(200, 350, 120, 12)
  .tagged("solid")
  .oneWayPlatform();
```

Objects pass through from below and land on top.

**Sensors (triggers)**

```javascript
var coin = prism.rect(200, 300, 12, 12)
  .tagged("coin")
  .trigger();
```

Sensors detect overlap without physical response.

**Swept collision**

For fast-moving objects that might tunnel through thin walls.

```javascript
prism.solveSwept(bullet, prism.group("wall"), dt);
```

### Collision Callbacks

```javascript
player
  .onEnter("coin", function (coin) {
    coin.kill();
    score++;
  })
  .onStay("lava", function () {
    health--;
  })
  .onLeave("water", function () {
    swimming = false;
  });
```

Call `.check()` in your update function for callbacks to fire.

```javascript
player.check();
```

### Groups and Tags

```javascript
var coin = prism.rect(200, 300, 12, 12).tagged("coin");
var allCoins = prism.group("coin");
```

Objects are automatically removed from their group when killed.

### Images and Sprites

**Loading images**

```javascript
prism.load("hero", "images/hero.png");

prism.loadAll({
  hero: "images/hero.png",
  tiles: "images/tileset.png",
  bg: "images/sky.png"
}, function () {
  // all loaded, start the game
  prism.play("game").loop();
});
```

**Drawing images directly**

```javascript
prism.drawImg("hero", 100, 200);
prism.drawImg("hero", 100, 200, 64, 64);
```

**Creating sprite objects**

```javascript
var hero = prism.sprite("hero", 100, 200);
```

Sprites support all game object methods: `.body()`, `.tagged()`, `.move()`, `.jump()`, and everything else.

### Animated Sprites

```javascript
var hero = prism.sprite("hero", 100, 200)
  .anim(32, 32, 4, 8);
```

Arguments: frame width, frame height, frame count, animation speed (ticks per frame).

Call `.tick()` every update to advance the animation.

```javascript
hero.tick();
```

Switch animation rows for different states.

```javascript
if (player.grounded) {
  if (prism.axisX() !== 0) hero.row(1);   // walk
  else hero.row(0);                         // idle
} else {
  hero.row(2);                              // jump
}
```

Flip the sprite for left/right facing.

```javascript
if (prism.key("ArrowLeft")) hero.flip(true, false);
if (prism.key("ArrowRight")) hero.flip(false, false);
```

### Scenes

Scenes organize your game into separate screens.

```javascript
prism.scene("menu")
  .on("enter", function () { })
  .on("leave", function () { })
  .on("update", function (dt) { })
  .on("draw", function () { });

prism.play("menu");
```

Store and retrieve data per scene.

```javascript
prism.scene("game")
  .set("score", 0)
  .on("update", function () {
    var s = prism.current().get("score");
    prism.current().set("score", s + 1);
  });
```

### Camera

```javascript
var cam = prism.camera()
  .follow(player, 0.14, 0.07)
  .dead(90, 50)
  .lead(30, 0)
  .limit(0, 0, 2400, 360)
  .use();

cam.snapToTarget();
```

**Follow configuration**

```javascript
cam.follow(player, 0.15, 0.06);  // separate X and Y lerp
cam.lockY();                       // only follow horizontally
cam.freeY();                       // unlock Y
cam.axis(true, false);             // explicit axis control
cam.lead(40, 0);                   // look-ahead
cam.offset(0, -60);               // screen offset
cam.dead(100, 60);                // deadzone
```

**Effects**

```javascript
cam.shake(8, 0.3);                // intensity and duration
cam.zoomTo(2);                     // zoom level
cam.rotateTo(0.1);                // rotation
```

**Drawing with the camera**

```javascript
cam.scope(function () {
  world.draw();
  player.draw();
});

// UI drawn outside the scope stays fixed on screen
prism.drawText("Score: " + score, 10, 10);
```

**Coordinate conversion**

```javascript
var worldPos = prism.toWorld(cam, screenX, screenY);
var screenPos = prism.toScreen(cam, worldX, worldY);
```

### Tilemaps

```javascript
var world = prism.tilemap("tiles", 16, 16)
  .tileset(8)
  .solids([1, 2, 3])
  .grid([
    [-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1, 2, 2,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1],
    [ 1, 1, 1, 1, 1, 1, 1, 1]
  ]);
```

**Drawing** (automatically culls off-screen tiles when a camera is active)

```javascript
world.draw();
```

**Collision**

```javascript
world.solve(player);
```

**Tile manipulation**

```javascript
var value = world.get(5, 3);
world.set(5, 3, -1);
var info = prism.tileAt(world, worldX, worldY);
```

**Tilemap raycasting**

```javascript
var hit = world.ray(x, y, dx, dy, 500);
```

Uses DDA algorithm for efficient grid traversal.

**Camera limits from tilemap**

```javascript
cam.limitTo(world);
```

### Raycasting

```javascript
// against a tagged group
var hit = prism.rayHitsGroup(x, y, dx, dy, "enemy", 300);

// from a game object
var hit = player.ray(1, 0, "wall", 200);

// against a tilemap
var hit = world.ray(px, py, 1, 0, 500);
```

All raycast functions return `{ target, dist, x, y }` or `{ col, row, value, dist, x, y }` for tilemaps. Returns null if nothing was hit.

### Timers

```javascript
prism.wait(2.0, function () {
  // runs after 2 seconds
});
```

### Canvas Transform Helpers

```javascript
prism.push();
prism.translate(400, 300);
prism.rotate(Math.PI / 4);
prism.scale(2);
prism.pop();
```

### Utility Functions

```javascript
prism.rand(10)              // integer 0 to 10
prism.rand(5, 20)           // integer 5 to 20
prism.randf(0.0, 1.0)       // float 0.0 to 1.0
prism.clamp(val, 0, 100)    // restrict to range
prism.dist(x1, y1, x2, y2) // distance between points
prism.angle(x1, y1, x2, y2)// angle in radians
prism.lerp(a, b, 0.5)       // linear interpolation
```

<br>

## Examples

### Complete Platformer

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Platformer</title>
<style>body{margin:0;overflow:hidden;background:#000;}</style>
</head>
<body>
<script src="prism2d.min.js"></script>
<script>

prism(640, 360).mode("pixel").quality("master").bg("#1a1a2e").gravity(0, 1400);

var player = prism.rect(60, 100, 20, 28)
  .color("#ff4757")
  .body()
  .maxSpeed(300, 900)
  .tagged("player");

var ground = prism.rect(0, 320, 2400, 40).color("#2ed573").tagged("solid");
var p1 = prism.rect(300, 240, 100, 16).color("#ffa502").tagged("solid");
var p2 = prism.rect(520, 180, 100, 16).color("#ffa502").tagged("solid");
var p3 = prism.rect(760, 240, 100, 16).color("#ffa502").tagged("solid");

var coins = [];
var score = 0;
for (var i = 0; i < 10; i++) {
  coins.push(
    prism.rect(200 + i * 120, 280, 10, 10)
      .color("#ffd32a")
      .tagged("coin")
      .trigger()
  );
}

player.onEnter("coin", function (c) {
  c.kill();
  score++;
  cam.shake(2, 0.1);
});

var cam = prism.camera()
  .follow(player, 0.14, 0.07)
  .dead(90, 50)
  .lead(30, 0)
  .limit(0, 0, 2400, 360)
  .use();

cam.snapToTarget();

prism.scene("play")
  .on("update", function (dt) {
    player.velX(prism.axisX() * 190);
    if (prism.keyHit("Space") || prism.keyHit("ArrowUp")) player.jump(430);
    if (prism.keyHit("ShiftLeft") && prism.axisX() !== 0) player.dash(prism.axisX(), 0, 500);
    player.solveGroup("solid");
    player.check();
    if (player.y > 500) player.at(60, 100).stop();
  })
  .on("draw", function () {
    cam.scope(function () {
      ground.draw();
      p1.draw();
      p2.draw();
      p3.draw();
      for (var i = 0; i < coins.length; i++) coins[i].draw();
      player.draw();
    });
    prism.drawText("Coins: " + score, 8, 8, {
      color: "#fff", size: 12, outline: true, outlineColor: "#000"
    });
  });

prism.play("play").loop();

</script>
</body>
</html>
```

### Complete Top-Down Shooter

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Top-Down</title>
<style>body{margin:0;overflow:hidden;background:#000;}</style>
</head>
<body>
<script src="prism2d.min.js"></script>
<script>

prism(640, 480).mode("pixel").quality("master").bg("#2d3436");

var player = prism.rect(300, 220, 20, 20)
  .color("#74b9ff")
  .kinematic()
  .tagged("player")
  .maxSpeed(200);

function addWall(x, y, w, h) {
  prism.rect(x, y, w, h).color("#636e72").tagged("wall");
}

addWall(0, 0, 640, 16);
addWall(0, 464, 640, 16);
addWall(0, 0, 16, 480);
addWall(624, 0, 16, 480);
addWall(200, 100, 16, 200);
addWall(400, 200, 16, 200);

var enemies = [];
for (var i = 0; i < 5; i++) {
  enemies.push(
    prism.rect(prism.rand(100, 550), prism.rand(100, 400), 16, 16)
      .color("#d63031")
      .kinematic()
      .tagged("enemy")
      .maxSpeed(60)
  );
}

var bullets = [];
var score = 0;

prism.scene("game")
  .on("update", function (dt) {
    player.moveAxis(prism.axisX(), prism.axisY(), 160);
    player.solveGroup("wall");

    if (prism.mouse.hit()) {
      var a = prism.angle(player.centerX(), player.centerY(),
        prism.mouse.x(), prism.mouse.y());
      var b = prism.circle(player.centerX() - 3, player.centerY() - 3, 3)
        .color("#ffeaa7").kinematic().tagged("bullet").moveDir(a, 400);
      b.life = 2;
      bullets.push(b);
    }

    for (var i = bullets.length - 1; i >= 0; i--) {
      bullets[i].life -= dt;
      if (bullets[i].life <= 0 || bullets[i].solveGroup("wall")) {
        bullets[i].kill();
        bullets.splice(i, 1);
        continue;
      }
      for (var j = enemies.length - 1; j >= 0; j--) {
        if (bullets[i] && bullets[i].hits(enemies[j])) {
          enemies[j].kill();
          enemies.splice(j, 1);
          bullets[i].kill();
          bullets.splice(i, 1);
          score++;
          break;
        }
      }
    }

    for (var e = 0; e < enemies.length; e++) {
      if (prism.dist(enemies[e].centerX(), enemies[e].centerY(),
        player.centerX(), player.centerY()) < 200) {
        enemies[e].chase(player, 50);
      } else {
        enemies[e].stop();
      }
      enemies[e].solveGroup("wall");
    }
  })
  .on("draw", function () {
    var walls = prism.group("wall");
    for (var w = 0; w < walls.length; w++) walls[w].draw();
    for (var e = 0; e < enemies.length; e++) enemies[e].draw();
    for (var b = 0; b < bullets.length; b++) bullets[b].draw();
    player.draw();
    prism.drawText("Score: " + score, 20, 20, { color: "#fff", size: 14 });
  });

prism.play("game").loop();

</script>
</body>
</html>
```

<br>

## API Reference

### Core

| Method | Description |
|---|---|
| `prism(w, h, parent)` | Initialize engine |
| `prism.init(config)` | Initialize with configuration object |
| `prism.bg(color)` | Set background color |
| `prism.size(w, h)` | Change canvas dimensions |
| `prism.mode(m)` | Set rendering mode: `"pixel"` or `"smooth"` |
| `prism.quality(q)` | Set quality level: `"canvas"` or `"master"` |
| `prism.scaleMode(s)` | Set scaling: `"fit"`, `"fill"`, `"stretch"`, `"none"` |
| `prism.smooth(bool)` | Toggle image smoothing |
| `prism.interpolate(bool)` | Toggle render interpolation |
| `prism.clear(color)` | Clear screen |
| `prism.alpha(a)` | Set global opacity (omit to reset to 1) |
| `prism.on(event, fn)` | Register global hook |
| `prism.off(event, fn)` | Remove global hook |
| `prism.loop(config)` | Start game loop |
| `prism.stop()` | Stop game loop |
| `prism.wait(seconds, fn)` | Delayed callback |
| `prism.canvas` | Raw canvas element |
| `prism.ctx` | Raw 2D rendering context |
| `prism.width` | Logical width |
| `prism.height` | Logical height |

### Scenes

| Method | Description |
|---|---|
| `prism.scene(name)` | Create or get a scene |
| `prism.play(name)` | Switch to a scene |
| `prism.current()` | Get current scene |
| `scene.on(event, fn)` | Register hook: `"enter"`, `"leave"`, `"update"`, `"draw"` |
| `scene.set(key, value)` | Store data |
| `scene.get(key)` | Retrieve data |

### Input

| Method | Description |
|---|---|
| `prism.key(k)` | Key is held |
| `prism.keyHit(k)` | Key was just pressed |
| `prism.keyUp(k)` | Key was just released |
| `prism.axisX()` | Horizontal axis: -1, 0, or +1 |
| `prism.axisY()` | Vertical axis: -1, 0, or +1 |
| `prism.mouse.x()` | Mouse screen X |
| `prism.mouse.y()` | Mouse screen Y |
| `prism.mouse.worldX()` | Mouse world X |
| `prism.mouse.worldY()` | Mouse world Y |
| `prism.mouse.down()` | Button is held |
| `prism.mouse.hit()` | Button was just pressed |
| `prism.mouse.up()` | Button was just released |
| `prism.touches()` | Array of touch points |
| `prism.isTouch()` | Is touch device |

### Drawing

| Method | Description |
|---|---|
| `prism.drawRect(x, y, w, h, color)` | Filled rectangle |
| `prism.drawRectLine(x, y, w, h, color, lw)` | Rectangle outline |
| `prism.drawRound(x, y, w, h, r, color)` | Rounded rectangle |
| `prism.drawCircle(x, y, r, color)` | Filled circle |
| `prism.drawCircleLine(x, y, r, color, lw)` | Circle outline |
| `prism.drawArc(x, y, r, start, end, color, lw)` | Arc |
| `prism.drawLine(x1, y1, x2, y2, color, lw)` | Line |
| `prism.drawTri(x1, y1, x2, y2, x3, y3, color)` | Triangle |
| `prism.drawPoly(points, color)` | Polygon |
| `prism.drawGradRect(x, y, w, h, c1, c2, vert)` | Gradient rectangle |
| `prism.drawText(text, x, y, opts)` | Text |
| `prism.drawImg(name, x, y, w, h)` | Image |
| `prism.measureText(text, size, font)` | Text width |
| `prism.shadow(color, blur, ox, oy)` | Enable shadow |
| `prism.noShadow()` | Disable shadow |
| `prism.blend(mode)` | Set blend mode |
| `prism.fill(color)` | Set fill color |
| `prism.stroke(color, lw)` | Set stroke |
| `prism.push()` | Save canvas state |
| `prism.pop()` | Restore canvas state |
| `prism.translate(x, y)` | Move origin |
| `prism.rotate(r)` | Rotate |
| `prism.scale(x, y)` | Scale |

### Game Objects

| Method | Description |
|---|---|
| `prism.rect(x, y, w, h)` | Create rectangle |
| `prism.circle(x, y, r)` | Create circle |
| `prism.sprite(name, x, y)` | Create sprite |
| `prism.render(obj)` | Render any object |
| `obj.color(c)` | Set color |
| `obj.at(x, y)` | Set position |
| `obj.size(w, h)` | Set dimensions |
| `obj.vel(vx, vy)` | Set velocity |
| `obj.velX(vx)` | Set X velocity |
| `obj.velX(vx)` | Set X velocity |
| `obj.velY(vy)` | Set Y velocity |
| `obj.addForce(fx, fy)` | Add to velocity |
| `obj.impulse(vx, vy)` | Replace velocity |
| `obj.move(dx, dy)` | Move by offset |
| `obj.moveX(dx)` | Move X |
| `obj.moveY(dy)` | Move Y |
| `obj.moveAxis(ix, iy, speed)` | Normalized movement |
| `obj.moveDir(angle, speed)` | Directional movement |
| `obj.moveToward(tx, ty, speed)` | Move toward point |
| `obj.chase(target, speed)` | Follow target |
| `obj.dash(dx, dy, speed)` | Dash |
| `obj.jump(force)` | Jump if grounded |
| `obj.jump(force, false)` | Jump always |
| `obj.jumpTo(vx, vy)` | Set both velocities |
| `obj.stop()` | Zero velocity |
| `obj.stopX()` | Zero X velocity |
| `obj.stopY()` | Zero Y velocity |
| `obj.rot(angle)` | Set rotation |
| `obj.flip(fx, fy)` | Flip |
| `obj.scaleXY(sx, sy)` | Set scale |
| `obj.lookAt(tx, ty)` | Rotate toward point |
| `obj.centerX()` | Center X |
| `obj.centerY()` | Center Y |
| `obj.setCenter(cx, cy)` | Position by center |
| `obj.left()` | Left edge |
| `obj.right()` | Right edge |
| `obj.top()` | Top edge |
| `obj.bottom()` | Bottom edge |
| `obj.hide()` | Make invisible |
| `obj.show()` | Make visible |
| `obj.freeze()` | Pause physics |
| `obj.unfreeze()` | Resume physics |
| `obj.tagged(tag)` | Assign to group |
| `obj.body()` | Enable gravity and physics |
| `obj.kinematic()` | Physics without gravity |
| `obj.gscale(g)` | Gravity multiplier |
| `obj.fric(f)` | Friction |
| `obj.bouncy(b)` | Bounce factor |
| `obj.maxSpeed(mx, my)` | Speed cap |
| `obj.oneWayPlatform()` | One-way collision |
| `obj.trigger()` | Sensor mode |
| `obj.draw()` | Render |
| `obj.kill()` | Hide and remove from physics |
| `obj.hits(other)` | Check collision |
| `obj.overlaps(other)` | Get overlap info |
| `obj.solveWith(other)` | Resolve collision |
| `obj.solveGroup(tag)` | Resolve against group |
| `obj.onEnter(tag, fn)` | First contact callback |
| `obj.onStay(tag, fn)` | Continuous overlap callback |
| `obj.onLeave(tag, fn)` | Separation callback |
| `obj.onHit(tag, fn)` | First contact callback |
| `obj.check()` | Process all callbacks |
| `obj.ray(dx, dy, tag, max)` | Raycast from center |
| `obj.tick()` | Advance animation |
| `obj.anim(fw, fh, count, speed)` | Set animation |
| `obj.row(r)` | Set animation row |
| `obj.frames(count)` | Set frame count |
| `obj.speed(sp)` | Set animation speed |

### Images

| Method | Description |
|---|---|
| `prism.load(name, src, cb)` | Load image |
| `prism.loadAll(map, cb)` | Load multiple images |
| `prism.image(name)` | Get raw Image object |

### Physics

| Method | Description |
|---|---|
| `prism.gravity(x, y)` | Set gravity |
| `prism.addBody(obj)` | Register body |
| `prism.removeBody(obj)` | Remove body |
| `prism.clearBodies()` | Remove all |
| `prism.group(tag)` | Get tagged objects |
| `prism.collide(a, b)` | Check collision |
| `prism.collideCC(a, b)` | Circle vs circle |
| `prism.collideCR(c, r)` | Circle vs rect |
| `prism.solve(a, b)` | Resolve collision |
| `prism.solveCC(a, b)` | Resolve circle vs circle |
| `prism.solveCR(c, r)` | Resolve circle vs rect |
| `prism.overlap(a, b)` | Get overlap info |
| `prism.sweptAABB(a, vx, vy, b)` | Swept test |
| `prism.solveSwept(obj, list, dt)` | Continuous resolve |
| `prism.raycast(x, y, dx, dy, list, max)` | Raycast |
| `prism.rayHitsGroup(x, y, dx, dy, tag, max)` | Raycast group |
| `prism.inRect(px, py, obj)` | Point in rect |
| `prism.inCircle(px, py, obj)` | Point in circle |
| `prism.moveTo(obj, x, y)` | Teleport |
| `prism.moveToward(obj, tx, ty, speed)` | Move toward |

### Tilemap

| Method | Description |
|---|---|
| `prism.tilemap(image, tw, th)` | Create tilemap |
| `prism.getTile(map, c, r)` | Get tile value |
| `prism.setTile(map, c, r, v)` | Set tile value |
| `prism.tileAt(map, wx, wy)` | Tile at world pos |
| `prism.isSolid(map, v)` | Check if solid |
| `prism.drawTilemap(map, cam)` | Render |
| `prism.collideTilemap(obj, map)` | Get hit tiles |
| `prism.solveTilemap(obj, map)` | Resolve |
| `prism.tilemapRay(map, x, y, dx, dy, max)` | Ray through tiles |
| `map.at(x, y)` | Set position |
| `map.grid(data)` | Set tile data |
| `map.tileset(cols)` | Set tileset columns |
| `map.solids(arr)` | Set solid tiles |
| `map.draw(cam)` | Render |
| `map.hits(obj)` | Check collision |
| `map.solve(obj)` | Resolve |
| `map.get(c, r)` | Get tile |
| `map.set(c, r, v)` | Set tile |
| `map.ray(x, y, dx, dy, max)` | Raycast |
| `map.worldWidth()` | Total width |
| `map.worldHeight()` | Total height |

### Camera

| Method | Description |
|---|---|
| `prism.camera(x, y)` | Create camera |
| `prism.beginCamera(cam)` | Apply transform |
| `prism.endCamera()` | Remove transform |
| `prism.toWorld(cam, sx, sy)` | Screen to world |
| `prism.toScreen(cam, wx, wy)` | World to screen |
| `cam.at(x, y)` | Set position |
| `cam.moveBy(dx, dy)` | Move camera |
| `cam.zoomTo(z)` | Set zoom |
| `cam.rotateTo(r)` | Set rotation |
| `cam.follow(target, lx, ly)` | Follow object |
| `cam.lerp(lx, ly)` | Set follow speed |
| `cam.axis(fx, fy)` | Set follow axes |
| `cam.lockX()` | Stop following X |
| `cam.lockY()` | Stop following Y |
| `cam.freeX()` | Resume X |
| `cam.freeY()` | Resume Y |
| `cam.lead(ox, oy)` | Look-ahead |
| `cam.offset(ox, oy)` | Screen offset |
| `cam.unfollow()` | Stop following |
| `cam.shake(amount, duration)` | Shake |
| `cam.limit(x, y, w, h)` | Set bounds |
| `cam.limitTo(map)` | Limit to tilemap |
| `cam.noLimit()` | Remove bounds |
| `cam.dead(w, h)` | Set deadzone |
| `cam.snapToTarget()` | Instant position |
| `cam.use()` | Set as active |
| `cam.begin()` | Apply transform |
| `cam.end()` | Remove transform |
| `cam.scope(fn)` | Draw inside scope |

### Utilities

| Method | Description |
|---|---|
| `prism.rand(max)` | Random integer 0 to max |
| `prism.rand(min, max)` | Random integer in range |
| `prism.randf(min, max)` | Random float |
| `prism.clamp(v, min, max)` | Restrict value |
| `prism.dist(x1, y1, x2, y2)` | Distance |
| `prism.angle(x1, y1, x2, y2)` | Angle in radians |
| `prism.lerp(a, b, t)` | Linear interpolation |
| `prism.snap(v)` | Pixel snap |

<br>

## Browser Support

Prism2D runs on any browser that supports HTML5 Canvas 2D and requestAnimationFrame. This includes all modern desktop and mobile browsers released since 2015.

| Browser | Minimum Version |
|---|---|
| Chrome | 31+ |
| Firefox | 23+ |
| Safari | 7+ |
| Edge | 12+ |
| Opera | 18+ |
| Chrome Android | 31+ |
| Safari iOS | 7+ |

<br>

## Contributing

Prism2D is open source under the MIT license. Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes in the `src/` files
4. Test by opening the HTML test file in a browser
5. Submit a pull request with a clear description of what you changed and why

Please follow the existing code style: no classes, no `new`, factory functions only, fluent chaining on all methods, and no external dependencies.

<br>

## License

MIT License. Use Prism2D for anything you want, commercial or personal, with no restrictions.

<br>

<p align="center">
  Prism2D version 1.0.0rc.1
  <br>
  Development started December 06, 2024
  <br>
  First public release September 13, 2026
  <br>
  Built with brutal minimalism.
</p>
