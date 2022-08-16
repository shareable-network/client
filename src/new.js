import { ethers } from 'ethers';
import 'quill/dist/quill.snow.css';
import Quill from "quill/quill";
import Delta from 'quill-delta';

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
      this.contentMetadata.push({ id: 'type', value: file.type.split('/')[0] });
      this.contentMetadata.push({ id: 'src', value: `https://shareable.infura-ipfs.io/ipfs/${cid}` });
      this.$nextTick(() => {
        M.updateTextFields();
      });
    },
    uploadWysiwygMedia: async function (file) {
      const cid = await this.upload(file);
      window.quill.updateContents(new Delta().insert({ video: `https://shareable.infura-ipfs.io/ipfs/${cid}` }));
    },
    uploadWysiwygText: async function (file) {
      const cid = await this.upload(file);
      this.contentMetadata.push({ id: 'type', value: 'html' });
      this.contentMetadata.push({ id: 'src', value: `https://shareable.infura-ipfs.io/ipfs/${cid}` });
      this.$nextTick(() => {
        M.updateTextFields();
      });
    },
    upload: async function (file) {
      this.uploading = true;
      const body = new FormData();
      body.append('file',file,file.name);
      const {path} = await fetch(`${window.location.origin}/api/upload`, {method: 'POST', body, credentials: 'include'}).then(r => r.json());
      this.uploading = false;
      return path;
    },
    save: async function () {
      const core = Alpine.raw(await this.$store.app.getCore());
      for (let i = 0; i < this.contentMetadata.length; i++) {
        if(!this.contentMetadata[i].id || !this.contentMetadata[i].value) continue;
        await core.setContentMetadata(
          ethers.utils.formatBytes32String(this.channelId),
          ethers.utils.formatBytes32String(this.collectionId),
          ethers.utils.formatBytes32String(this.contentId),
          ethers.utils.formatBytes32String(
            this.contentMetadata[i].id),
          this.contentMetadata[i].value,
        );
      }
    },
  };
};
