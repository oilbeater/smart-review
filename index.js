import core from '@actions/core';
import github from '@actions/github';
import axios from 'axios';
import { ChatGPTAPI } from 'chatgpt';
import fetch from 'node-fetch';

const DEFAULT_MODEL = 'gpt-3.5-turbo'
const DEFAULT_TEMPERATURE = 0.1
const DEFAULT_TOP_N = 1
const SYSTEM_MESSAGE =
    'You are a professional programmer reviewing the code patch diff below' +
    ' and you only focus on the commit message, potential bugs, format errors, performance issues and ways to improve. ' +
    'Give feedbacks that might need further changes to the patch. ' +
    'Each feedback should starts with "- [ ] "';

async function run() {
    try {
        const apiKey = core.getInput('apiKey', {required: true})
        const githubToken = core.getInput('githubToken', {required: true})
        const model = core.getInput('model') || DEFAULT_MODEL
        const temperature = +core.getInput('temperature') || DEFAULT_TEMPERATURE
        const top_n = +core.getInput('top_n') || DEFAULT_TOP_N
        const debug = core.getBooleanInput('debug')
        const systemMessage = core.getInput('systemMessage') || SYSTEM_MESSAGE

        const context = github.context
        const pr = context.payload.pull_request;
        const patchUrl = pr.diff_url;
        core.info('pr patch url is ' + patchUrl)
        const response = await axios.get(patchUrl);
        const patchContent = response.data;
        core.info('pr patch data is ' + patchContent.length)
        const chatAPI = new ChatGPTAPI({
            apiKey: apiKey,
            debug: debug,
            completionParams: {
                model: model,
                temperature: temperature,
                top_p: top_n,
            },
            fetch: fetch,
        });

        core.info('start send')
        console.time('code-review cost');
        const res = await chatAPI.sendMessage(patchContent, {systemMessage: systemMessage});
        console.timeEnd('code-review cost');
        core.info(res.text);

        const octokit = github.getOctokit(githubToken);
        await octokit.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: res.text,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
