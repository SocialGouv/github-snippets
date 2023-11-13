const axios = require('axios');

const githubToken = process.env.GITHUB_TOKEN; // Replace with your GitHub token
const organizationName = 'SocialGouv'; // Replace with your organization name
const teamName = process.env.TEAM_NAME; // Replace with your team name
const githubApiUrl = 'https://api.github.com';

const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
};

async function getRepositoriesForTeam(organizationName, teamName) {
    try {
        // Update this URL according to the GitHub API for fetching repositories for a specific team
        const response = await axios.get(`${githubApiUrl}/orgs/${organizationName}/teams/${teamName}/repos`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}

async function deleteSecret({
  organizationName,
  repo,
  secretName,
  environment,
}) {
  const { id: repoId, name: repoName } = repo;
  try {
    console.log(
      `deleting secret ${secretName} from repository ${repoName}${
        environment ? " in " + environment : ""
      }`
    );
    const url = environment
      ? `${githubApiUrl}/repositories/${repoId}/environments/${environment}/secrets/${secretName}`
      : `${githubApiUrl}/repos/${organizationName}/${repoName}/actions/secrets/${secretName}`;

    await axios.delete(url, { headers });
    console.log(
      `deleted secret ${secretName} from repository ${repoName} repoID ${repoId} ${
        environment ? " in " + environment : ""
      }`
    );
  } catch (error) {
    if (error.status===404){
      console.error(`secret ${secretName} from repository ID ${repoId} doesn't exists`);
    }else{
      console.error(
        `Error deleting secret ${secretName} from repository ID ${repoId}:`,
        error.status
      );
    }
  }
}


async function main() {
  const repositories = await getRepositoriesForTeam(organizationName, teamName);
  for (const repo of repositories) {
    await deleteSecret({
      organizationName,
      repo,
      secretName: "DEPLOY_KEY",
    });
    await deleteSecret({
      organizationName,
      repo,
      secretName: "KUBECONFIG",
    });
    await deleteSecret({
      organizationName,
      repo,
      secretName: "KUBECONFIG",
      environment: "production",
    });
  }
}

main();
