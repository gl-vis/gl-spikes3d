gl-spikes
=========
Draws axis spikes compatible with gl-axes.  This can be useful to illustrate selections or specific points in a point cloud

## Example

## Install

```
npm install gl-spikes
```

## API

### `var spikes = require('gl-spikes')(gl, options)`
Creates a new spike object.

* `gl` is a WebGL context
* `options` is a list of optional parameters which are passed along

### Methods

#### `spikes.draw(camera)`
Draws the axis spikes using the given camera coordinates.

* `camera.model` is the model matrix for the camera
* `camera.view` is the view matrix
* `camera.projection` is the projection matrix

#### `spikes.update(options)`
Updates the parameters of the axes spikes. `options` is an object with the following properties:

* `position` the position of the spike ball in data coordinates
* `bounds` the bounds of the axes object
* `colors` an array of 3 length 3 arrays encoding the colors for the spikes along the x/y/z directions
* `enabled` a flag which if set turns on or off the spikes
* `drawSides` a flag which if set turns on or off the projected spikes in each data plane

#### `spikes.dispose()`
Destroys the spike object and releases all associated resources.

## Credits
(c) 2014 Mikola Lysenko. MIT License