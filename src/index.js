import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    if (github.context.payload.pull_request === undefined) {
      throw new Error("Can't get pull_request payload. Check you trigger pull_request event");
    }
    const { assignees, number, user: { login: author, type } } = github.context.payload.pull_request;

    if (assignees.length > 0) {
      core.info(`Skips the process to add assignees since the pull request is already assigned to someone`);
      return;
    }
    if (type === 'Bot') {
      core.info("Skips the process to add assignees since the author is bot");
      return;
    }

    const octokit = github.getOctokit(token);
    const result = await octokit.issues.addAssignees({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: number,
      assignees: [author]
    });
    core.debug(JSON.stringify(result));
    core.info(`@${author} has been assigned to the pull request: #${number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
