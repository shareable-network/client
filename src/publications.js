import sanitizeHtml from 'sanitize-html';

window.publicationsRoute = () => {
  return {
    entries: [],
    load: async function () {
      if (this.entries.length === 0) {
        await this.getEntryList();
      }
    },

    getEntryList: async function () {
      const {entries} = await fetch(`${window.location.origin}/api/entries`).then(r => r.json());
      this.entries = entries;
      this.$nextTick(() => {
        M.Materialbox.init(document.querySelectorAll('.materialboxed'), {});
      });
    },

    saveReaction: async function (entry) {
      await fetch(`${window.location.origin}/api/entries/${entry.key}/reaction`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reaction: entry.reaction})
      }).then(r => r.json());
    },

    saveComment: async function (entry) {
      await fetch(`${window.location.origin}/api/entries/${entry.key}/comment`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({comment: entry.comment})
      }).then(r => r.json());
    },

    getUrl: function (entry) {
      // todo: support other gateways
      return entry.contentMetadata.src.replace("ipfs://", "https://agra.network/ipfs/");
    },

    appendContent: async function (entry, el) {
      // todo: support other gateways
      const url = entry.contentMetadata.src.replace("ipfs://", "https://agra.network/ipfs/");
      let content = '<style>img, audio, video {max-width: 100%;}</style>';
      content += await fetch(url).then(res => res.text());
      content = content.replace("ipfs://", "https://agra.network/ipfs/");
      const blacklist = {script: true};
      content = sanitizeHtml(content, {
        allowedTags: false,
        allowedAttributes: false,
        exclusiveFilter: function (frame) {
          return blacklist[frame.tag];
        },
      });

      const shadow = el.attachShadow({mode: 'open'});
      shadow.innerHTML = content;
    },
  };
};
