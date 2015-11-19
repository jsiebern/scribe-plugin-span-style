# scribe-plugin-span-style
A Scribe Plugin for adding inline styles through &lt;span> elements

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

```

**Known Issues / Todo**
- Multi-Line selections do not get styled properly
- Safari does not wrap the text into the spans correctly, scribe itself does not support Safari, so need to think about a workaround