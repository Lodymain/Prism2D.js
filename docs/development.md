## Development Guide

This guide explains how Prism2D.js is organized and how to work with its source code.

The goal is to make development easier to understand, whether you are fixing a bug, improving an existing feature, or adding something new. You do not need to understand the entire engine before contributing, but it helps to know where things belong and how the different modules work together.

## Working with the Source Code

The `src/` directory contains the engine's source files. This is where development changes should normally be made.

Prism2D.js is organized into small modules, each responsible for a particular part of the engine. Some modules handle the main game loop, while others handle rendering, input, physics, cameras, or audio.

When working on a feature, start by finding the module responsible for it. Keeping changes in the appropriate place makes the code easier to understand, maintain, and improve over time.

The `build/prism2d.js` file provides the engine as a single JavaScript file for distribution. Unless a change specifically concerns the build or release process, work in "src/" rather than editing the bundled file directly.

## Project Structure

The source code is divided into the following areas:
```
src/
├── index.js
├── core/
│   ├── engine.js
│   ├── loop.js
│   └── scenes.js
├── input/
│   └── input.js
├── graphics/
│   ├── renderer.js
│   ├── sprites.js
│   └── particles.js
├── physics/
│   ├── aabb.js
│   └── tilemap.js
├── camera/
│   └── camera.js
└── audio/
    └── audio.js

build/
└── prism2d.js

docs/
```
Each module has a specific responsibility. Before adding new code, check whether an existing module already handles the functionality you need.

## Understanding Each Source File

`src/index.js`

This is the entry point of the engine. It creates the main "prism" function, initializes the shared state, and exposes the engine through "global.prism".

The shared state includes information about the canvas, rendering, timing, scenes, physics, input, audio, cameras, and other engine systems.

Because so many modules rely on this shared object, changes to "index.js" can affect the entire engine.

Development guidelines:

- Keep the main entry point focused on initialization and shared state.
- Avoid adding feature-specific implementations here when they belong in an existing module.
- Be careful when renaming or removing shared properties.
- If a new system needs shared state, consider whether it genuinely belongs here before adding it.

For example, rendering-specific functionality belongs in "graphics/renderer.js", not in "index.js".

`src/core/engine.js`

This module handles the engine's initialization and core configuration.

Its responsibilities include creating and configuring the canvas, resizing it, setting rendering options, managing background settings, and providing general utilities.

It also manages the engine's event hooks and configuration related to rendering quality, scaling, interpolation, and pixel behavior.

Use this module when changing general engine configuration or initialization behavior.

Avoid putting unrelated features here simply because they need access to the main "prism" object.

`src/core/loop.js`

This module manages the game loop.

It handles frame timing, fixed-timestep updates, drawing callbacks, and the systems updated during the loop. These include timers, physics bodies, scenes, cameras, and particles.

Changes here can affect the behavior of the whole engine, particularly timing and update order.

When modifying the loop, pay attention to:

- Update and draw timing.
- The order in which systems are updated.
- Timer behavior.
- Start and stop behavior.
- How changes affect physics and rendering.

A small change to the loop can have consequences beyond the feature being modified, so test the affected systems carefully.

`src/core/scenes.js`

This module manages scenes.

It creates scene objects and provides functionality for registering scene callbacks, storing scene-specific data, switching scenes, and accessing the current scene.

Scene-related changes should normally stay here rather than being mixed into the main engine initialization or rendering code.

When changing scene behavior, consider how the change affects existing scenes and their callbacks.

`src/input/input.js`

This module handles user input.

It manages keyboard, mouse, and touch events, including input state and pointer-coordinate transformations.

It also exposes helpers for checking keys, detecting newly pressed or released keys, reading directional input, and accessing touch information.

Use this module when adding or changing input-related functionality.

Keep input handling separate from the systems that consume the input. For example, a gameplay feature that reacts to a key press does not automatically belong in "input.js".

`src/graphics/renderer.js`

This module contains the engine's main rendering functionality.

It provides drawing operations for rectangles, circles, lines, polygons, triangles, arcs, gradients, and text. It also manages drawing styles, shadows, blending, and canvas transformations.

The file additionally contains shape creation and rendering functionality, including support for shape properties, chaining methods, grouping, and integration with physics-related behavior.

Because this module already handles several closely related responsibilities, read the existing implementation before adding new rendering features.

Development guidelines:

- Keep drawing operations consistent with the existing API.
- Follow the established naming and argument conventions.
- Preserve chainable behavior where existing methods use it.
- Avoid introducing unnecessary duplication between drawing functions.
- Be careful when changing shape properties or behavior used by other systems.

Do not split "renderer.js" into new modules simply because it is a large file. A new module should solve a clear organizational problem and fit the engine's existing dependency structure.

`src/graphics/sprites.js`

This module handles image loading and sprite-related functionality.

It includes helpers for loading images, loading multiple images, retrieving image resources, drawing images, creating sprites, and managing sprite animation settings.

Changes involving image resources or sprite animation should normally be made here.

When modifying sprite behavior, consider both drawing and animation. Make sure existing code that uses sprites continues to work as expected.

`src/graphics/particles.js`

This module implements particle emitters and particle behavior.

It provides functionality for positioning emitters, emitting particles, creating bursts, starting and stopping emission, updating particles, drawing them, counting active particles, and clearing them.

Use this module for particle-related changes.

Keep particle-specific logic here unless a change genuinely requires coordination with another system, such as the main game loop or renderer.

`src/physics/aabb.js`

This module contains the engine's main physics and collision functionality.

Its responsibilities include managing bodies and groups, applying gravity, updating body movement, detecting overlaps, resolving collisions, handling swept collision checks, performing raycasts, and providing movement helpers.

Physics changes require particular care because different systems may rely on the same body properties and collision behavior.

Before changing collision detection or resolution, consider:

- How the change affects existing bodies.
- Whether it changes collision results.
- How groups and multiple bodies interact.
- Whether fast-moving objects are affected.
- Whether movement helpers still behave consistently.

Prefer focused changes that preserve existing behavior unless a different result is intentional.

`src/physics/tilemap.js`

This module handles tilemap-related functionality.

It provides operations for accessing and changing tiles, checking whether tiles are solid, drawing tilemaps, handling tilemap collisions, and performing tilemap ray checks.

Tilemap-specific functionality belongs here.

When modifying this module, consider how tile access, rendering, collision detection, and collision resolution work together.

If a change also affects the general physics system, review "aabb.js" and the relevant call sites before deciding where the implementation belongs.

`src/camera/camera.js`

This module manages the camera system.

It includes camera positioning, following targets, interpolation, axis locking, look-ahead behavior, offsets, screen shake, limits, dead zones, snapping, and coordinate conversion between world and screen space.

Camera changes should stay here when they concern camera behavior.

Be particularly careful with coordinate transformations. A change that affects world-to-screen conversion may also affect input coordinates, rendering, and object positioning.

`src/audio/audio.js`

This module handles audio functionality.

It manages audio context access, sound loading, sound playback, stopping sounds, volume settings, and simple tone generation.

Audio-related changes should normally be implemented here.

When modifying audio behavior, consider browser audio restrictions, resource loading, and how existing callers use the sound API.

Avoid adding audio-specific logic to the main engine or game loop unless the design genuinely requires it.

## How the Modules Work Together

The source files are separate, but the engine's systems are connected.

For example, adding a feature that makes the camera follow a moving object may involve the camera system and the physics or movement code. A feature that changes how sprites are drawn may involve both sprite handling and rendering.

Before making a cross-module change, take a moment to identify:

1. Where the feature should be implemented.
2. Which modules provide the functionality it depends on.
3. Which other modules call or rely on the affected code.
4. Whether the change alters existing behavior or public APIs.
5. How the result can be tested.

Keep the implementation in the most appropriate module and modify other modules only when there is a clear reason.

This is not a rule against cross-module changes. Some features naturally require them. The important thing is to understand the dependencies instead of spreading related code across the project without a clear structure.

5. Module Pattern and Shared State

Prism2D.js uses immediately invoked function expressions (IIFEs) to organize its source files.

A typical module follows this pattern:
```js
(function (global) {
  var prism = global.prism;

  // Module implementation goes here.
})(typeof window !== "undefined" ? window : this);
```
The IIFE creates a local scope for the module. The "global" argument provides access to the global object, while "var prism = global.prism" gives the module access to the shared engine object.

Modules extend the existing "prism" object by assigning functions and properties to it.

For example, a module may define a method like this:

(function (global) {
  var prism = global.prism;

  prism.exampleFeature = function () {
    // Feature implementation
    return prism;
  };
})(typeof window !== "undefined" ? window : this);

This is a simplified example of the existing pattern, not a replacement for the actual implementation.

When creating a new module:

- Follow the established IIFE pattern.
- Access the shared engine object consistently.
- Keep temporary variables and helper functions local when they do not need to be exposed.
- Expose only the functionality that other parts of the engine need.
- Follow existing naming, formatting, and return-value conventions.

Do not introduce a different module system, such as ES module imports and exports, without first considering how it would work with the engine's existing loading and distribution setup.

6. Public APIs and Internal Helpers

Not every property or function on "prism" is intended to be part of the public API.

The engine exposes methods that users can call in their games, while other properties and functions exist to support internal behavior.

Names beginning with an underscore, such as "_emit" or "_updateParticles", generally indicate internal functionality in this project. Treat this naming convention as a warning that the implementation may not be intended for direct use by game developers.

Before changing an existing method or property, check how it is used throughout the source code and whether it is documented for users.

When changing public APIs:

- Preserve existing behavior whenever possible.
- Avoid renaming or removing established methods without a strong reason.
- Consider whether existing games will continue to work.
- Update relevant documentation and examples when behavior changes.
- Explain breaking changes clearly when they cannot be avoided.

Internal APIs can also have dependencies, so an underscore does not mean a function can be changed without checking its callers.

7. Loading Order and Dependencies

Prism2D.js relies on a specific order when its source files are loaded directly in the browser.

The initial module creates the shared "prism" object, and subsequent modules access that object and extend it. Modules may also depend on functions provided by earlier modules.

Use the following order when loading the source files directly:

<script src="src/index.js"></script>
<script src="src/core/engine.js"></script>
<script src="src/core/loop.js"></script>
<script src="src/core/scenes.js"></script>
<script src="src/input/input.js"></script>
<script src="src/graphics/renderer.js"></script>
<script src="src/graphics/sprites.js"></script>
<script src="src/graphics/particles.js"></script>
<script src="src/physics/aabb.js"></script>
<script src="src/physics/tilemap.js"></script>
<script src="src/camera/camera.js"></script>
<script src="src/audio/audio.js"></script>

Preserve this order unless the project's dependency structure has been checked and the change has been tested.

When adding a new module, identify the functions and state it needs before deciding where it should be loaded. Also check whether existing modules need to use functionality provided by the new module.

Changing the script order without checking these dependencies can cause functions or properties to be unavailable when a module executes or when a feature is used.

The "build/prism2d.js" file provides the engine as a single file. Keep changes in the source files unless you are specifically working on the build or distribution process. Do not assume that editing a source file automatically updates the bundled file.

8. Adding a New Feature

Before implementing a feature, decide whether it belongs in an existing module or needs a new one.

Extend an existing module when:

- The feature is a natural extension of that module's responsibility.
- The required helpers and state already belong there.
- Adding it will not make the module unnecessarily difficult to maintain.

Consider a new module when:

- The feature has a distinct responsibility.
- Its implementation would make an existing module harder to understand.
- It can be integrated without introducing confusing dependencies.
- The additional file improves the overall organization rather than simply moving code elsewhere.

For example, a new drawing primitive would normally belong in "graphics/renderer.js", while a new sound-control method would normally belong in "audio/audio.js".

A feature that affects multiple systems may need changes in more than one file. Plan those changes before implementing them.

A practical workflow

1. Read the relevant module and understand the existing implementation.
2. Search for related functions and references in other files.
3. Decide where the change belongs.
4. Identify possible effects on existing behavior and public APIs.
5. Implement the smallest clear change that solves the problem.
6. Verify the feature and check for regressions.
7. Update documentation or examples if users need to understand the change.

If the feature introduces a new module, also consider its dependencies and where it belongs in the loading order.

9. Code Style and Maintainability

Prism2D.js has an established coding style. New code should fit naturally into the surrounding implementation rather than introducing a different style without a good reason.

In practice:

- Follow the conventions used in the file you are modifying.
- Use clear names that communicate purpose.
- Keep functions focused on a specific responsibility.
- Reuse existing helpers when they are appropriate.
- Avoid unnecessary duplication.
- Keep private implementation details local when possible.
- Avoid changing unrelated code as part of a focused fix.
- Preserve existing API behavior unless the change intentionally modifies it.

The goal is not to make every part of the engine look different or to refactor everything at once. It is to make improvements that fit the current architecture and remain easy for other contributors to understand.

If a different approach would significantly improve the code, explain the reason and its trade-offs instead of introducing a broad architectural change without discussion.

10. Testing Changes

Test the behavior affected by your changes rather than assuming that code which looks correct will work correctly in the engine.

Depending on the change, verification may include:

- Running a browser example that uses the affected feature.
- Checking the browser console for errors.
- Testing normal behavior and relevant edge cases.
- Confirming that related features still work.
- Checking whether input, rendering, timing, or collision behavior has changed unexpectedly.

For changes to the game loop, physics, or rendering, pay particular attention to regressions because these systems can affect many features.

For changes to module loading or shared state, verify that the affected modules initialize and work in the expected order.

The project may not provide automated tests for every system. Do not assume a test command exists without checking the current project configuration. If a suitable automated test setup is available, use it alongside manual verification.

11. Documentation and Examples

Documentation is part of maintaining the engine.

If a change affects how developers use a feature, update the relevant documentation or examples so that they reflect the actual implementation.

Examples should use real, supported APIs and demonstrate the intended behavior clearly. Avoid documenting methods or configuration options that have not been implemented.

When changing an API, check whether the README, API documentation, or existing examples rely on the previous behavior.

12. Before Submitting a Change

Before submitting your work, take a moment to review it:

- [ ] The change belongs in the appropriate module.
- [ ] Existing naming and coding conventions have been followed.
- [ ] Related dependencies and callers have been checked.
- [ ] Public API compatibility has been considered.
- [ ] The loading order has been preserved or verified if relevant.
- [ ] The affected behavior has been tested.
- [ ] The browser console has been checked for relevant errors.
- [ ] Documentation or examples have been updated where necessary.
- [ ] Unrelated changes have been avoided.

Not every item applies to every contribution. Use your judgment, but do not skip checks that are relevant to the change.

Final Note

Prism2D.js is easier to maintain when each part of the engine has a clear responsibility and contributors understand how their changes affect the rest of the project.

You do not need to know everything before contributing. Start with the relevant module, follow the existing patterns, check dependencies, and test your work.

When a change affects the architecture or introduces a new dependency, take the time to discuss the approach before committing to a larger implementation. A little planning can prevent unnecessary complexity and make the engine better for everyone.
