'use strict';

module.exports = function (styleName) {
    return function(scribe) {
        var spanStyleCommand = new scribe.api.SimpleCommand(styleName);
        spanStyleCommand.nodeName = 'SPAN';

        var clearChildStyles = function(root) {
            if (typeof root === 'undefined' || typeof root.childNodes === 'undefined' || typeof root.nodeType === 'undefined' || root.nodeType === 3) return;

            for (var i in root.childNodes) {
                clearChildStyles(root.childNodes[i]);
            }

            root.style[styleName] = '';
            if (root.nodeName === 'SPAN') {
                if (!root.getAttribute('style')) {
                    scribe.node.unwrap(root.parentNode, root);
                }
            }
        };

        var nextNode = function(node) {
            if (node.hasChildNodes()) {
                return node.firstChild;
            }
            else {
                while (node && !node.nextSibling) {
                    node = node.parentNode;
                }
                if (!node) {
                    return null;
                }
                return node.nextSibling;
            }
        };

        var getRangeSelectedNodes = function(range) {
            var node = range.startContainer;
            var endNode = range.endContainer;

            if (node === endNode) {
                return [node];
            }

            var rangeNodes = [];
            while (node && node !== endNode) {
                rangeNodes.push(node = nextNode(node));
            }

            node = range.startContainer;
            while (node && node !== range.commonAncestorContainer) {
                rangeNodes.unshift(node);
                node = node.parentNode;
            }

            return rangeNodes;
        };

        var getLogicalCombinations = function(fragments) {
            var p = [];
            for (var i=0;i<fragments.length;i++) {
                var f = fragments[i];

                p.push(f);
                for (var x = i+1;x<fragments.length;x++) {
                    f += fragments[x];
                    p.push(f);
                }
            }
            return p;
        };

        var styleLogicalFragments = function(root, fragments, value) {
            if (typeof root === 'undefined' || root.nodeType === 3) return;

            if (fragments.indexOf(root.textContent) > -1) {
                clearChildStyles(root);
                root.style[styleName] = value;
            }
            else if (root.childNodes) {
                for (var i in root.childNodes) {
                    styleLogicalFragments(root.childNodes[i], fragments, value);
                }
            }
        };

        var normalizeNodes = function(root) {
            if (typeof root === 'undefined' || root.nodeType === 3 || typeof root.nodeType === 'undefined') return;

            if (root.childNodes) {
                for (var i in root.childNodes) {
                    normalizeNodes(root.childNodes[i]);
                }
            }

            root.normalize();
        };

        var createSubRange = function(node, start, end) {
            var subRange = document.createRange();
            subRange.setStart(node, start);
            subRange.setEnd(node, end);

            return subRange;
        };

        spanStyleCommand.execute = function(value) {
            var selection = new scribe.api.Selection();
            var range = selection.range;

            if (typeof value.range !== 'undefined') {
                // Sometimes a click on the firing element (button etc.) causes the selection to lose focus
                // If needed a range from the original selection can be passed alongside the value
                range = value.range;
                value = value.value;
            }

            if (range.collapsed) {
                // Trying to style a collapsed range makes no sense
                return;
            }

            scribe.transactionManager.run(function() {
                var nodes = getRangeSelectedNodes(range);

                if (nodes.length === 1) {
                    var node = nodes[0];
                    var parent = node.parentNode;
                    if (node.nodeType === 3) {
                        if (parent.textContent === range.startContainer.textContent.substr(range.startOffset,range.endOffset)) {
                            clearChildStyles(parent);
                            parent.style[styleName] = value;
                        }
                        else {
                            var span = document.createElement('span');
                            span.style[styleName] = value;

                            range.surroundContents(span);
                        }
                    }
                }
                else {
                    var startOffset = range.startOffset;
                    var startContainer = range.startContainer;
                    var endOffset = range.endOffset;
                    var endContainer = range.endContainer;

                    var fragments = [];
                    for (var i in nodes) {
                        var node = nodes[i];
                        if (node.nodeType === 3) {
                            if (node === range.startContainer) {
                                fragments.push(node.textContent.substr(range.startOffset));
                            }
                            else if (node === range.endContainer) {
                                fragments.push(node.textContent.substr(0,range.endOffset));
                            }
                            else {
                                fragments.push(node.textContent);
                            }
                        }
                    }
                    fragments = getLogicalCombinations(fragments);

                    if (scribe.el.childNodes) {
                        for (var i in scribe.el.childNodes) {
                            var rootNode = scribe.el.childNodes[i];
                            styleLogicalFragments(rootNode, fragments, value);
                        }
                    }

                    if (startOffset > 0) {
                        var parent = startContainer.parentNode;
                        if (parent.innerText === startContainer.textContent.substr(startOffset)) {
                            clearChildStyles(parent);
                            parent.style[styleName] = value;
                        }
                        else {
                            var subRange = createSubRange(startContainer, startOffset, startContainer.textContent.length);

                            var span = document.createElement('span');
                            span.style[styleName] = value;

                            subRange.surroundContents(span);
                        }
                    }

                    if (endOffset < endContainer.textContent.length) {
                        var parent = endContainer.parentNode;
                        if (parent.innerText === endContainer.textContent.substr(0,endOffset)) {
                            clearChildStyles(parent);
                            parent.style[styleName] = value;
                        }
                        else {
                            var subRange = createSubRange(endContainer, 0, endOffset);

                            var span = document.createElement('span');
                            span.style[styleName] = value;

                            subRange.surroundContents(span);
                        }
                    }

                }

                if (scribe.el.childNodes) {
                    normalizeNodes(scribe.el);
                }
            });
        };

        spanStyleCommand.queryState = function() {
            var selection = new scribe.api.Selection();
            return !!selection.getContaining(function(node) {
                if (node.style) {
                    return (node.style[styleName] !== '');
                }
                return false;
            });
        };

        scribe.commands[styleName] = spanStyleCommand;
    };
};