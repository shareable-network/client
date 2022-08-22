import Block from 'quill/blots/block';
import Link from 'quill/formats/link';

class PlainVideo extends Block {
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

PlainVideo.blotName = 'plain-video';
PlainVideo.tagName = 'video';


export default PlainVideo;
