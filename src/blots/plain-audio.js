import Block from 'quill/blots/block';
import Link from 'quill/formats/link';

class PlainAudio extends Block {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('controls', true);
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

PlainAudio.blotName = 'plain-audio';
PlainAudio.tagName = 'audio';


export default PlainAudio;
