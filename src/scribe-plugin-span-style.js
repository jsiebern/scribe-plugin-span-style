module.exports = function(styleName) {
    return function(scribe) {
        let spanStyleCommand = new scribe.api.SimpleCommand(styleName);
        spanStyleCommand.nodeName = 'SPAN';

        let clearChildStyles = (root) => {
            if (typeof root === 'undefined' || typeof root.childNodes === 'undefined') return;

            for (let i in root.childNodes) {
                let child = root.childNodes[i];

                clearChildStyles(child.childNodes);

                if (child.nodeName === 'SPAN') {
                    child.style[styleName] = '';
                    if (!child.getAttribute('style')) {
                        scribe.node.unwrap(root, child);
                    }
                }
            }
        };

        spanStyleCommand.execute = function(value) {
            scribe.transactionManager.run(() => {
                let selection = new scribe.api.Selection();
                let range = selection.range;

                // Get Range Text & Current Node Text
                let selectedHtmlDocumentFragment = range.extractContents();
                let tDiv = document.createElement('div');
                tDiv.appendChild(selectedHtmlDocumentFragment.cloneNode(true));
                let rangeText = tDiv.innerText;
                let nodeText = selection.selection.focusNode.textContent;

                // Determine if we need a new node
                let isNewNode = true;
                if (nodeText === rangeText) {
                    isNewNode = (selection.selection.focusNode.parentElement.nodeName === 'SPAN') ? false : true;
                }

                // Create / Get SPAN
                let span = (!isNewNode) ? selection.selection.focusNode.parentElement : document.createElement('span');
                span.appendChild(selectedHtmlDocumentFragment);
                if (isNewNode) {
                    range.insertNode(span);
                    range.selectNode(span);
                }
                // Clear Setting for children
                clearChildStyles(span);

                // Apply new Font-Size
                span.style[styleName] = value;

                // Re-apply the range
                selection.selection.removeAllRanges();
                selection.selection.addRange(range);
            });
        };

        spanStyleCommand.queryState = function() {
            var selection = new scribe.api.Selection();
            return !!selection.getContaining(node => {
                if (node.style) {
                    return (node.nodeName === this.nodeName && node.style[styleName] !== '');
                }
                return false;
            });
        };

        scribe.commands[styleName] = spanStyleCommand;
    };
};