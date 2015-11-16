define(function () {
    'use strict';

    return function (styleName) {
        return function(scribe) {
            var spanStyleCommand = new scribe.api.SimpleCommand(styleName);
            spanStyleCommand.nodeName = 'SPAN';

            var clearChildStyles = (root) => {
                if (typeof root === 'undefined' || typeof root.childNodes === 'undefined') return;

                for (var i in root.childNodes) {
                    var child = root.childNodes[i];

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
                scribe.transactionManager.run(function() {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;

                    // Get Range Text & Current Node Text
                    var selectedHtmlDocumentFragment = range.extractContents();
                    var tDiv = document.createElement('div');
                    tDiv.appendChild(selectedHtmlDocumentFragment.cloneNode(true));
                    var rangeText = tDiv.innerText;
                    var nodeText = selection.selection.focusNode.textContent;

                    // Determine if we need a new node
                    var isNewNode = true;
                    if (nodeText === rangeText) {
                        isNewNode = (selection.selection.focusNode.parentElement.nodeName === 'SPAN') ? false : true;
                    }

                    // Create / Get SPAN
                    var span = (!isNewNode) ? selection.selection.focusNode.parentElement : document.createElement('span');
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
            }.bind(this);

            scribe.commands[styleName] = spanStyleCommand;
        };
    };
});