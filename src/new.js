import 'quill/dist/quill.snow.css';
import Quill from "quill/quill";
import Delta from 'quill-delta';
import PlainVideo from './blots/plain-video';
import PlainAudio from './blots/plain-audio';
import PlainImage from './blots/plain-image';

Quill.register(PlainVideo, true);
Quill.register(PlainAudio, true);
Quill.register(PlainImage, true);

window.newPublicationRoute = () => {
  return {
    channelId: null,
    collectionId: null,
    contentId: null,
    contentMetadata: [
      {id: 'keywords', value: '', hint: 'comma separated'},
      {id: 'description', value: ''},
    ],
    uploading: false,
    init: async function () {
      this.$nextTick(() => {
        window.quill = new Quill('#editor', {
          theme: 'snow',
          modules: {
            toolbar: {
              container: '#toolbar-container',
              handlers: {
                upload: () => {
                  document.querySelector('#toolbar-container input[type="file"]').click();
                },
                undo: () => {
                  window.quill.history.undo();
                },
                redo: () => {
                  window.quill.history.redo();
                }
              }
            },
          },
        });
        M.Tabs.init(document.querySelector('.tabs'), {});
        M.updateTextFields();
      });
    },
    uploadMedia: async function (file) {
      const cid = await this.upload(file);
      this.contentMetadata.push({id: 'type', value: file.type.split('/')[0]});
      this.contentMetadata.push({id: 'src', value: `https://shareable.infura-ipfs.io/ipfs/${cid}`});
      this.$nextTick(() => {
        M.updateTextFields();
      });
    },
    uploadWysiwygMedia: async function (file) {
      const cid = await this.upload(file);
      document.querySelector('#toolbar-container input[type="file"]').value = null;
      const position = window.quill.getSelection()?.index || 0;
      const blot = 'plain-' + file.type.split('/')[0];
      const url = `https://shareable.infura-ipfs.io/ipfs/${cid}`;
      window.quill.updateContents(new Delta().retain(position).insert({[blot]: url}));
    },
    uploadWysiwygText: async function (file) {
      const cid = await this.upload(file);
      this.contentMetadata.push({id: 'type', value: 'html'});
      this.contentMetadata.push({id: 'src', value: `https://shareable.infura-ipfs.io/ipfs/${cid}`});
      this.$nextTick(() => {
        M.updateTextFields();
      });
    },
    upload: async function (file) {
      this.uploading = true;
      const body = new FormData();
      body.append('file', file, file.name);
      const {path} = await fetch(`${window.location.origin}/api/upload`, {method: 'POST', body}).then(r => r.json());
      this.uploading = false;
      return path;
    },
    save: async function () {
      await fetch(`${window.location.origin}/api/entries`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          channelId: this.channelId,
          collectionId: this.collectionId,
          contentId: this.contentId,
          contentMetadata: this.contentMetadata
        })
      }).then(r => r.json());
    },
  };
};
