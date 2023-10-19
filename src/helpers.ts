import { exec } from '@actions/exec'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { DryRunJson } from './turbo'

type Octokit = ReturnType<typeof github.getOctokit>

export const conventionalNameToEmoji = {
  build: '👷',
  chore: '🧹',
  ci: '🤖',
  docs: '📝',
  feat: '✨',
  fix: '🐛',
  perf: '⚡️',
  refactor: '♻️',
  revert: '⏪',
  style: '🎨',
  test: '✅'
}

export type ConventionalType = keyof typeof conventionalNameToEmoji

/**
 * Checks if a commit message is a conventional commit.
 */
function isConventionalCommit(message: string): boolean {
  // No capture groups or length limits, just a simple regex to check if the message matches the conventional commit format
  // Check that type is one of the conventional types
  const regex =
    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?: .+/
  return regex.test(message)
}

interface CommitMetadata {
  type: keyof typeof conventionalNameToEmoji
  scope: string
  description: string
}

function extractCommitMetadata(message: string): CommitMetadata {
  const regex =
    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?: (.+)/
  const match = regex.exec(message)
  if (match === null) {
    throw new Error(`Failed to parse commit message: ${message}`)
  }
  return {
    type: match[1] as ConventionalType,
    scope: match[2],
    description: match[3]
  }
}

interface GitLog {
  sha: string
  message: string
}

/**
 * Get the list of shas between the current and previous sha.
 * Uses git log to print the sha and commit message header for each commit.
 * @param currentSha
 * @param previousSha
 * @returns List of shas between the current and previous sha
 */
export async function gitLog(
  currentSha: string,
  previousSha: string
): Promise<GitLog[]> {
  let shas = ''
  const result = await exec(
    'git',
    ['log', `${previousSha}..${currentSha}`, '--pretty="format:%H %s"'],
    {
      listeners: {
        stdout: (data: Buffer) => {
          shas += data.toString()
        }
      }
    }
  )

  if (result !== 0) {
    throw new Error('Failed to get git log')
  }

  const commits = shas.split('\n').map(commit => {
    const [sha, message] = commit.split(' ')
    return { sha, message }
  })

  return commits
}

export async function releaseSha(
  octokit: Octokit,
  context: Context,
  environment: string
): Promise<string> {
  // Get deployment statuses for the selected environment
  const deploymentStatuses = await octokit.rest.repos.listDeployments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    environment
  })

  if (deploymentStatuses.status !== 200) {
    throw new Error(`Failed to get deployments for environment ${environment}`)
  }

  let previousSha: string

  // Find commit ref for the latest deployment, if any
  if (deploymentStatuses.data.length > 0) {
    const latestDeployment = deploymentStatuses.data[0]
    previousSha = latestDeployment.sha
  } else {
    previousSha = github.context.sha
  }

  return previousSha
}

export async function processCommits(
  commits: GitLog[],
  workspace: string
): Promise<CommitMetadata[]> {
  const metadataList: CommitMetadata[] = []

  // Checkout commit using shell script
  for (const commit of commits) {
    let result = ''
    const exitCode = await exec(
      'pnpm',
      [
        'turbo',
        'run',
        'build',
        `--filter='${workspace}...[${commit.sha}^1]'`,
        '--dry=json'
      ],
      {
        listeners: {
          stdout: (data: Buffer) => {
            result += data.toString()
          }
        }
      }
    )

    if (exitCode !== 0) {
      continue
    }

    // Parse output and see if commit affects workspace
    const json = JSON.parse(result) as DryRunJson
    const packages = json.packages
    if (packages.includes(workspace) && isConventionalCommit(commit.message)) {
      try {
        const metadata = extractCommitMetadata(commit.message)
        metadataList.push(metadata)
      } catch (error) {
        // Ignore commits that don't follow the conventional commit format
      }
    }
  }
  return metadataList
}

export function groupCommits(
  commits: CommitMetadata[]
): Record<keyof typeof conventionalNameToEmoji, CommitMetadata[]> {
  return commits.reduce(
    (acc, metadata) => {
      if (!acc[metadata.type]) {
        acc[metadata.type] = []
      }
      acc[metadata.type].push(metadata)
      return acc
    },
    {} as Record<keyof typeof conventionalNameToEmoji, CommitMetadata[]>
  )
}
