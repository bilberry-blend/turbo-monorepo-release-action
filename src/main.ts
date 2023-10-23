import * as core from '@actions/core'
import * as github from '@actions/github'
import { format } from 'date-fns'
import {
  ConventionalType,
  commitsToMetadata,
  conventionalNameToEmoji,
  createRelease,
  gitLog,
  groupCommits,
  processCommits
} from './helpers'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get some initial context and inputs necessary for the action
    const prefix: string = core.getInput('prefix', { required: true })
    const token: string = core.getInput('github-token', { required: true })
    const workspace: string = core.getInput('workspace', { required: true })
    const from: string = core.getInput('from', { required: true })
    const to: string = core.getInput('to', { required: true })
    const octokit = github.getOctokit(token)

    const date = new Date()
    const releaseTitle = `${prefix}-${format(date, 'yyyy-MM-dd-HH-mm')}`

    // Process all commits since the last release and group them by type
    const commits = await gitLog(from, to)

    core.startGroup('Commits in range')
    for (const commit of commits) {
      core.info(`${commit.sha} - ${commit.message}`)
    }
    core.endGroup()

    core.startGroup('Relevant commits')
    const relevantCommits = await processCommits(commits, workspace)
    for (const commit of relevantCommits) {
      core.info(`${commit.sha} - ${commit.message}`)
    }
    core.endGroup()

    const metadataList = commitsToMetadata(relevantCommits)
    const groupedMetadata = groupCommits(metadataList)

    core.startGroup('Grouped metadata')
    core.debug(JSON.stringify(groupedMetadata, null, 2))
    core.endGroup()

    // Create a release body from the grouped metadata
    const releaseBody = Object.entries(groupedMetadata)
      .map(([type, list]) => {
        const emoji = conventionalNameToEmoji[type as ConventionalType] // Object.entries trashes the type
        const metadataLines = list.map(metadata => `- ${metadata.description}`)
        return `${emoji} **${type}**\n\n${metadataLines.join('\n')}`
      })
      .join('\n\n\n')

    // Create a release
    const release = await createRelease(
      octokit,
      github.context,
      releaseTitle,
      releaseBody
    )

    core.startGroup('Release information')
    core.info(releaseTitle)
    core.info('---')
    core.info(releaseBody)
    core.info('---')
    core.info(release.html_url)
    core.endGroup()

    // Add release URL as an output
    core.setOutput('release-url', release.html_url)
    core.setOutput('release-title', release.name)
    core.setOutput('release-body', release.body)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
