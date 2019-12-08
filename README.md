Columinizes tall image like a web page screenshot to easy to see on PC screen.

Using [sharp](https://www.npmjs.com/package/sharp) to operate images.

# Example

```javascript
const { ImageColumnizer } = require('sharp-columnizer')

(async() {
  const src = ImageColumnizer.openImageFile('screenshot.png')
  const columinizer = new ImageColumnizer({
    margin: ImageColumnizer.margin(50, 50, 50, 50), // top, right, bottom, left: default 0
    gap: 50, // default 0
    indent: 100, // default 0
    outdent: 100, // default 0
  })
  const dest = await columnizer.composite()
  // dest is sharp image (https://www.npmjs.com/package/sharp)
  await dest.png().toFile('columnized.png')
})()
```

# Options

![Options](options.png)