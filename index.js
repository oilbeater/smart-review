const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
    try {
        const pr = github.context.payload.pull_request;
        const patchUrl = pr.patch_url;
        const response = await axios.get(patchUrl);
        const patchContent = response.data;
        console.log('PR Patch Content:', patchContent);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
