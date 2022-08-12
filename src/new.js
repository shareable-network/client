import { create } from 'ipfs-http-client';
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
      const authorization = 'Basic ' + btoa(
        this.$store.app.infuraIpfsProjectId + ':' +
        this.$store.app.infuraIpfsProjectSecret,
      );
      const ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: { authorization }
      });
      const { cid } = await ipfs.add(file);
      this.uploading = false;
      return cid;
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
