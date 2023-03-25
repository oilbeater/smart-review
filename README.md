# Smart Review

This GitHub Action uses OpenAI to provide AI-powered code reviews. 
With this action, you can get feedback on your PR's, 
which can help you catch errors, performance issues and improve the overall quality of your codebase.

This project was inspired by [anc95/ChatGPT-CodeReview](https://github.com/anc95/ChatGPT-CodeReview), 
the main difference is that it allows customizing the `systemMessage` to adjust the focus and output format of the AI review according to one's own needs.

## Inputs

-  `apiKey` (required): The OpenAI API key.
-  `githubToken` (required): The GitHub token.
-  `model` (optional): The model used to review code. Defaults to `gpt-3.5-turbo`.
-  `temperature` (optional): The model temperature. Defaults to `0.1`.
-  `top_n` (optional): The model top_n. Defaults to `1`.
-  `systemMessage` (optional): The system message sent to the ChatGPT API, which allows you to focus on specific areas for review.

## Example Usage

You only need to set the secret `OPENAI_API_KEY` in your repo before running the action. The `GITHUB_TOKEN` secret will be set automatically by Github Action.

```yaml
uses: oilbeater/smart-review@main
with:
  apiKey: ${{ secrets.OPENAI_API_KEY }}
  githubToken: ${{ secrets.GITHUB_TOKEN }}
```

In this example, the action is run using the `OPENAI_API_KEY` and `GITHUB_TOKEN` secrets. 
The `model`, `temperature`, `top_n`, and `systemMessage` inputs are left at their default values.

## Limitation

- The Azure OpenAI endpoint is currently unsupported.
- A patch of significant size may exceed the token limit for OpenAI.
