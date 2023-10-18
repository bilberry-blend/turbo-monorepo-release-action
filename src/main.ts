import * as core from '@actions/core'
import * as github from '@actions/github'
import { format } from 'date-fns'
import { ConventionalType, conventionalNameToEmoji, gitLog, groupCommits, processCommits, releaseSha } from './helpers'


/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {

    // Get some initial context and inputs necessary for the action
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo
    const environment: string = core.getInput('github-environment', { required: true })
    const prefix: string = core.getInput('prefix', { required: true })
    const token: string = core.getInput('github-token', { required: true })
    const workspace: string = core.getInput('workspace', { required: true })

    const octokit = github.getOctokit(token)

    const date = new Date()
    const releaseTitle = `${prefix}-${format(date, 'yyyy-MM-dd-HH-mm')}`

    // Process all commits since the last release
    const previousSha = await releaseSha(octokit, github.context, environment)
    const commits = await gitLog(github.context.sha, previousSha)
    const metadataList = await processCommits(commits, workspace)

    // Finally group metadata by type and create a pretty release body
    const groupedMetadata = groupCommits(metadataList)


    const releaseBody = Object.entries(groupedMetadata).map(([type, metadataList]) => {
      const emoji = conventionalNameToEmoji[type as ConventionalType] // Object.entries trashes the type
      const metadataLines = metadataList.map(metadata => `- ${metadata.description}`)
      return `${emoji} **${type}**\n\n${metadataLines.join('\n')}`
    }).join('\n\n\n')

    // Create a release
    const release = await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: releaseTitle,
      name: releaseTitle,
      body: releaseBody,
      draft: false,
      prerelease: false,
    })

    // Add release URL as an output
    core.setOutput('release-url', release.data.html_url)
    core.setOutput('release-title', release.data.name)
    core.setOutput('release-body', release.data.body)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
