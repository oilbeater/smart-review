import core from '@actions/core';
import github from '@actions/github';
import axios from 'axios';
import { ChatGPTAPI } from 'chatgpt';
import fetch from 'node-fetch';

async function run() {
    try {
        const pr = github.context.payload.pull_request;
        const patchUrl = pr.patch_url;
        core.info('pr patch url is ' + patchUrl)
        const response = await axios.get(patchUrl);
        const patchContent = response.data;
        core.info('pr patch data is ' + patchContent.length)
        const chatAPI = new ChatGPTAPI({
            apiKey: '',
            completionParams: {
                model: 'gpt-3.5-turbo',
                temperature: 0.1,
                top_p: 1,
            },
            fetch: fetch,
        });
        const systemMessage = 'You are a professional Golang programmer reviewing the code patch and giving feedbacks focus only on potential bugs, format errors, if the commit message is enough to describe this patch and ways to improve.';

        core.info('start send')
        console.time('code-review cost');
        const res = await chatAPI.sendMessage(patchContent, {systemMessage: systemMessage});
        console.timeEnd('code-review cost');
        core.info(res.text);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
