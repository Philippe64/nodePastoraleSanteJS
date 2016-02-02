# tiny-ssi

A minimal implementation of Apache SSI (server-side includes)

Code originally from https://github.com/donofkarma/node-ssi-parser/blob/master/lib/node-ssi-parser.js
but for some reason that package is not published on npm, so that all I've done here.


## Usage

Currently only really supports doing includes, eg. 

```html

 <!--#include virtual="header.html" -->
 
    <div class="container">
        <h1>title</h1>
        <p class="lead">
          contents
        </p>
    </div>
 <!--#include virtual="footer.html" -->

```

expecting that 'header.html' and 'footer.html' are in the same folder as the above html file,
you can then do:

```javascript
var ssiParser = require('tiny-ssi');

var finalHTML = ssiParser("/dummy/path", someHTMLContent); 
console.log("processed html looks like:"+finalHTML);
```

## License

MIT

