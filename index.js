import core from '@actions/core';
import github from '@actions/github';
import axios from 'axios';
import { ChatGPTAPI } from 'chatgpt';
import fetch from 'node-fetch';

const DEFAULT_MODEL = 'gpt-3.5-turbo'
const DEFAULT_TEMPERATURE = 0.1
const DEFAULT_TOP_N = 1

async function run() {
    try {
        const apiKey = core.getInput('apiKey', {required: true});
        const apiBaseUrl = core.getInput('apiBaseUrl', {required: false}) || 'https://api.openai.com/v1';
        const githubToken = core.getInput('githubToken', {required: true});
        const model = core.getInput('model') || DEFAULT_MODEL;
        const temperature = +core.getInput('temperature') || DEFAULT_TEMPERATURE;
        const top_n = +core.getInput('top_n') || DEFAULT_TOP_N;
        const debug = core.getBooleanInput('debug');

        const context = github.context;
        const pr = context.payload.pull_request;
        const patchUrl = pr.diff_url;
        core.info('pr patch url is ' + patchUrl)
        const response = await axios.get(patchUrl);
        const patchContent = response.data;
        core.info('pr patch data is ' + patchContent.length);
        const chatAPI = new ChatGPTAPI({
            apiKey: apiKey,
            apiBaseUrl: apiBaseUrl,
            debug: debug,
            completionParams: {
                model: model,
                temperature: temperature,
                top_p: top_n,
            },
            fetch: fetch,
        });
    

        const SYSTEM_MESSAGE =
            `You are a professional programmer tasked with reviewing a ${context.repo.owner}/${context.repo.repo} code patch diff.` +
            `Fist you need to find all the code and information you know about ${context.repo.owner}/${context.repo.repo} and learn them.` +
            'Focus on potential bugs, formatting errors, performance issues, and areas for improvement.' +
            'Patch lines starting with a "-" indicate that these lines are from the previous version and have been changed.' +
            'Patch lines starting with a "+" indicate that the code has been newly updated or added.' +
            'Identify a minimum of 5 key feedback points, order them by priority.' +
            'Only output feedbacks that might necessitate code changes.' +
            'Begin each feedback point with "- [ ] "';
        const systemMessage = core.getInput('systemMessage') || SYSTEM_MESSAGE;
        core.info(systemMessage);
        core.info('start send');
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
