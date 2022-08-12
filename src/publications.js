import {ethers} from 'ethers';

window.publicationsRoute = () => {
  return {
    entries: [],
    load: async function () {
      this.$watch('$store.app.publisher', (publisher, prevPublisher) => {
        if (this.entries.length === 0 && publisher && !prevPublisher) {
          this.getEntryList();
        }
      });
      this.$watch('$store.app.chainId', () => {
        if(this.entries.length === 0) this.getEntryList.bind(this);
      });
      if (this.entries.length === 0 && this.$store.app.publisher && this.$store.app.chainIsValid()) {
        await this.getEntryList();
      }
    },

    getEntryList: async function () {
      if (!this.$store.app.chainIsValid()) {
        console.log('chain is invalid');
        return;
      }
      const core = Alpine.raw(await this.$store.app.getCore());
      const provider = Alpine.raw(await this.$store.app.getProvider());
      const url = 'https://api-testnet.snowtrace.io/api?module=logs&action=getLogs&address=0xf5Ab549c213b8FbE9e715f748868A3A3A5A6B3C3&topic0=0xca5832298b75b3645c83fda3dd6a040cba1dcb84367849a900217078ac7b8500&apikey=43ZXDMZX38BJK5EDAR5MDP1A2Y6URPB1CY';
      const rawEvents = (await fetch(url).then(r => r.json())).result;
      const coreEvents = rawEvents.map(i => core.interface.parseLog(i));
      const entryIds = [];

      for (let i = 0; i < coreEvents.length; i++) {
        const event = coreEvents[i];
        const {
          publisher,
          channelId,
          collectionId,
          contentId,
        } = event.args;
        const types = ['address', 'bytes32', 'bytes32', 'bytes32'];
        const args = [publisher, channelId, collectionId, contentId];
        const entryId = ethers.utils.solidityKeccak256(types, args);
        if (entryIds.includes(entryId)) continue;

        const channelIdDecoded =
          ethers.utils.parseBytes32String(channelId);
        const collectionIdDecoded =
          ethers.utils.parseBytes32String(collectionId);
        const contentIdDecoded =
          ethers.utils.parseBytes32String(contentId);
        const [keywordIds, keywordValues] =
          await provider.getKeywords(entryId, 0, 10);
        const keywords = this.$store.app.arraysToObject(
          keywordIds, keywordValues);
        const [commentIds, commentAuthors, commentValues, commentStatuses] =
          await provider.getComments(entryId, 0, 10);
        const commentValuesObject = this.$store.app.arraysToObject(commentIds, commentValues);
        const commentAuthorsObject = this.$store.app.arraysToObject(commentIds, commentAuthors);
        const commentStatusesObject = this.$store.app.arraysToObject(commentIds, commentStatuses);
        const comments = this.$store.app.mergeObjects({
          value: commentValuesObject,
          author: commentAuthorsObject,
          status: commentStatusesObject
        });
        const [reactionIds, reactionValues] =
          await provider.getAggregatedReactions(entryId, 0, 10);
        const reactions = this.$store.app.arraysToObject(
          reactionIds, reactionValues);
        const [contentMetadataIds, contentMetadataValues] =
          await core.getContentMetadata(
            publisher, channelId, collectionId, contentId);
        const contentMetadata = this.$store.app.arraysToObject(
          contentMetadataIds, contentMetadataValues);
        let [subContentIds, totalSubContent] = await core.getSubContentList(
          publisher, channelId, collectionId, contentId, 0, 10);
        totalSubContent = totalSubContent.toString();
        this.entries.unshift({
          key: entryId,
          publisher,
          channelIdDecoded,
          collectionIdDecoded,
          contentIdDecoded,
          keywords,
          comments,
          reactions,
          contentMetadata,
          subContentIds,
          totalSubContent,
          reaction: null,
          comment: null,
        });
        entryIds.push(entryId);
      }
    },

    saveReaction: async function (entry) {
      const provider = await this.$store.app.getProvider();
      await provider.createReaction(
        entry.key,
        ethers.utils.formatBytes32String(
          Math.random().toString(36).substring(2, 10)),
        ethers.utils.formatBytes32String(entry.reaction),
        [],
        { value: ethers.utils.parseUnits('1.0', 'gwei') },
      );
    },

    saveComment: async function (entry) {
      const provider = await this.$store.app.getProvider();
      await provider.createComment(
        entry.key,
        ethers.utils.formatBytes32String(
          Math.random().toString(36).substring(2, 10)),
        [],
        entry.comment,
        { value: ethers.utils.parseUnits('1.0', 'gwei') },
      );
    },
  };
};
