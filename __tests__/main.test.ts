/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'
import * as helpers from '../src/helpers'

type Octokit = ReturnType<typeof github.getOctokit>
type CreateReleaseResponse = Awaited<
  ReturnType<Octokit['rest']['repos']['createRelease']>
>

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput')
const setFailedMock = jest.spyOn(core, 'setFailed')
const setOutputMock = jest.spyOn(core, 'setOutput')

// Mock the side-effecting helper functions from src/helpers.ts
const gitLogMock = jest.spyOn(helpers, 'gitLog')
const processCommitsMock = jest.spyOn(helpers, 'processCommits')
const releaseShaMock = jest.spyOn(helpers, 'releaseSha')
const createReleaseMock = jest.spyOn(helpers, 'createRelease')

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    gitLogMock.mockImplementation(() => {
      return Promise.resolve([
        {
          sha: '2345678901',
          message: 'test commit'
        },
        {
          sha: '1234567890',
          message: 'test commit'
        }
      ])
    })

    processCommitsMock.mockImplementation(() => {
      return Promise.resolve([
        {
          sha: '2345678901',
          message: 'feat: Added awesome date picker'
        },
        {
          sha: '1234567890',
          message: 'fix: Fixed bug in date picker'
        }
      ])
    })

    releaseShaMock.mockImplementation(() => {
      return Promise.resolve('1234567890')
    })

    createReleaseMock.mockImplementation(() => {
      return Promise.resolve({
        html_url: 'https://example.com',
        name: 'test release',
        body: 'test release body'
      } as CreateReleaseResponse['data'])
    })
  })

  it('creates release and sets the release outputs', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'github-environment':
          return 'production'
        case 'prefix':
          return 'my-app'
        case 'github-token':
          return '1234567890'
        case 'workspace':
          return 'my-app'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'release-url',
      expect.stringMatching('https://example.com')
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'release-title',
      expect.stringMatching('test release')
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      3,
      'release-body',
      expect.stringMatching('test release body')
    )
  })

  it('sets a failed status if git log fails', async () => {
    // Set the action's inputs as return values from core.getInput()
    gitLogMock.mockImplementation(() => {
      throw new Error('Failed to get git log')
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Failed to get git log')
  })

  it('sets a failed status if previousSha fails', async () => {
    // Set the action's inputs as return values from core.getInput()
    releaseShaMock.mockImplementation(() => {
      throw new Error('Failed to get previousSha')
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Failed to get previousSha'
    )
  })

  it('sets a failed status if createRelease fails', async () => {
    // Set the action's inputs as return values from core.getInput()
    createReleaseMock.mockImplementation(() => {
      throw new Error('Failed to create release')
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Failed to create release')
  })
})
