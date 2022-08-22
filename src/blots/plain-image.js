import Block from 'quill/blots/block';
import Link from 'quill/formats/link';

class PlainImage extends Block {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('src', this.sanitize(value));
    return node;
  }

  static sanitize(url) {
    return Link.sanitize(url);
  }

  static value(domNode) {
    return domNode.getAttribute('src');
  }
}

PlainImage.blotName = 'plain-image';
PlainImage.tagName = 'img';


export default PlainImage;
