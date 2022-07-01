window.newPublicationRoute = () => {
    return {
        publisher: null,
        channelId: null,
        collectionId: null,
        contentId: null,
        contentMetadata: [
            { id: 'type', value: 'video' },
            { id: 'src', value: null },
        ],
        content: null,
        init: async function () {
            this.publisher = await this.$store.app.getPublisher();
        },
        save: async function () {
            const authorization = 'Basic ' + btoa(
                this.$store.app.infuraIpfsProjectId + ':' +
                this.$store.app.infuraIpfsProjectSecret,
            );
            const ipfs = window.IpfsHttpClient.create({
                host: 'ipfs.infura.io',
                port: 5001,
                protocol: 'https',
                headers: { authorization }
            });
            const { cid } = await ipfs.add(this.content[0]);
            this.contentMetadata[1].value = `https://shareable.infura-ipfs.io/ipfs/${cid}`;

            const core = Alpine.raw(await this.$store.app.getCore());
            for (let i = 0; i < this.contentMetadata.length; i++) {
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
