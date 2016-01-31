# scribe-plugin-span-style
A Scribe Plugin for adding inline styles through `<span>` elements.

*The description `<span>` is probably not accurate anymore. From 0.2.0 on, the plugin will now use any available tags it can find, that includes `<b>`,`<i>`,`<strong>`,`<em>`,`<li>`,`etc`. Only if it is not able to use one of those will it create a `<span>` to wrap the selection into.*

**Example:**
```javascript
import Scribe from 'scribe-editor';
import ScribeSpanStyleCommand from 'scribe-plugin-span-style';

// ...............

let scribe = new Scribe(document.querySelector('#my-editor'));
scribe.use(ScribeSpanStyleCommand('color'));
scribe.use(ScribeSpanStyleCommand('fontSize'));
scribe.use(ScribeSpanStyleCommand('fontFamily'));

// ...............

let command = scribe.getCommand('fontSize');
command.execute('24px');

// ...............

let command = scribe.getCommand('fontSize');
let originalRange = scribe.selection.range;

// Some more code that causes the selection to lose focus...

command.execute({
    value: '24px',
    range: originalRange
});

```

**Requirements**
- Scribe should always put `<p>` or `<div>` tags as the root nodes of your lines

**Known Issues / Todo**
- Heavily nested `<span>` nodes sometimes do not get unwrapped properly
- Untested performance on a lot of text ("logical" algorithm might be a bit slow for that)
- Untested in older browsers
- Identical text segments / nodes throughout the text can receive the new style though not selected

**Changelog**

*v0.2.0*
- Complete code makeover
- Multi-line selections are supported mostly reliable now (even cross browser)
- Implemented "logical" algorithm to keep the nesting as clean as possible
- Supports the passing of an object as value now (`{value: '12px', range: originalRange}`) to support input elements that might cause losing the selection before execution of the command
