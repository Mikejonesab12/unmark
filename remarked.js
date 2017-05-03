var JSDOM = require('jsdom').JSDOM,
	Converters = require('./lib/converters.js');

function Remarked() {

}

Remarked.prototype.convert = function(html) {
	var result;

	if (typeof html !== 'string') throw 'HTML must be a string.';

	this.DOM = new JSDOM(html);
	this.body = this.DOM.window.document.body;

	result = this.build(this.body, {md:'', block:''});

	return result.block;
};

Remarked.prototype.build = function(node, result) {
	var self = this,
		children = Array.prototype.slice.call(node.childNodes),
		childMd;

	if (node.nodeType === 3) {
		result.md = self.converters.text(node.textContent);
	}

	childMd = children.reduce(function(text, child) {
		return text += self.build(child, result).md;
	}, '');

	if (node.nodeType === 1 && !self.blockElements.includes(node.tagName)) {
		result.md = (self.converters[node.tagName] || self.converters['default'])(childMd, node);
	}

	if (node.nodeType === 1 && self.blockElements.includes(node.tagName)) {
		result.block += (self.converters[node.tagName] || self.converters['default'])(childMd, node);
		result.md = '';
	}

	return result;
};

Remarked.prototype.blockElements = [
	'DIV',
	'ADDRESS',
	'ARTICLE',
	'SECTION',
	'HEADER',
	'FOOTER'
];

Converters(Remarked);

module.exports = Remarked;
