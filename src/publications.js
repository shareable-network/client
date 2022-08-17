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
  };
};
