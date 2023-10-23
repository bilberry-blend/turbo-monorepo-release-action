# Turbo Monorepo Release Action

Create release for a Turbo Monorepo for a commit range. It is intended to be
used in a workflow that creates a deployment. The action accepts two commits
representing a range.

These commits are then filtered down by two criteria:

1. The commit subject matches the conventional commit format
1. The commit triggers a change in the workspace as defined by turbo build

They are grouped by type (fix, feat, etc) and a release is created using the
GitHub API. The release content is set as action output, so it can be used in
subsequent steps.

## Pre-requisites

You need to have setup node and npx in your workflow before using this action.

```yaml
steps:
  - name: Setup node
    uses: actions/setup-node@v2
    with:
      node-version: '20'
```

## Inputs

| Name           | Description              | Required | Default |
| -------------- | ------------------------ | -------- | ------- |
| `github-token` | GitHub token             | true     |         |
| `workspace`    | Turbo workspace name     | true     |         |
| `prefix`       | Prefix for release title | false    | ""      |
| `from`         | Commit SHA to start from | true     |         |
| `to`           | Commit SHA to end at     | true     |         |

## Outputs

| Name            | Description           |
| --------------- | --------------------- |
| `release-title` | Release title         |
| `release-body`  | Release description   |
| `release-url`   | Release URL to GitHub |

## Example usage¨

```yaml
on: [deployment]
# Release job:
jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Create release
        uses: go-fjords/create-release-from-deployment-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          # Get the environment from the deployment event
          github-environment: ${{ github.event.deployment.environment }}
          workspace: my-workspace
          prefix: 'My App'
          # Get the previous commit somehow
          from: 6b81ece3474de57f7fa070192fa1b88e303acb2a
          # Get the last release commit from the deployment event
          to: ${{ github.event.deployment.ref }}
      - name: Print release URL
        run: echo ${{ steps.create-release.outputs.release-url }}
```

## Update the Action Code

The [`src/`](./src/) directory is the heart of your action! This contains the
source code that will be run when your action is invoked. You can replace the
contents of this directory with your own code.

There are a few things to keep in mind when writing your action code:

- Most GitHub Actions toolkit and CI/CD operations are processed asynchronously.
  In `main.ts`, you will see that the action is run in an `async` function.

  ```javascript
  import * as core from '@actions/core'
  //...

  async function run() {
    try {
      //...
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  ```

  For more information about the GitHub Actions toolkit, see the
  [documentation](https://github.com/actions/toolkit/blob/master/README.md).

So, what are you waiting for? Go ahead and start customizing your action!

1. Create a new branch

   ```bash
   git checkout -b releases/v1
   ```

1. Replace the contents of `src/` with your action code
1. Add tests to `__tests__/` for your source code
1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > [!WARNING]
   >
   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc)
   > to build the final JavaScript action code with all dependencies included.
   > If you do not run this step, your action will not work correctly when it is
   > used in a workflow. This step also includes the `--license` option for
   > `ncc`, which will create a license file for all of the production node
   > modules used in your project.

1. Commit your changes

   ```bash
   git add .
   git commit -m "My first action is ready!"
   ```

1. Push them to your repository

   ```bash
   git push -u origin releases/v1
   ```

1. Create a pull request and get feedback on your action
1. Merge the pull request into the `main` branch

Your action is now published! :rocket:

For information about versioning your action, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

## Validate the Action

You can now validate the action by referencing it in a workflow file. For
example, [`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an
action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v3

  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

For example workflow runs, check out the
[Actions tab](https://github.com/actions/typescript-action/actions)! :rocket:

## Usage

After testing, you can create version tag(s) that developers can use to
reference different stable versions of your action. For more information, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

To include the action in a workflow in another repository, you can use the
`uses` syntax with the `@` symbol to reference a specific branch, tag, or commit
hash.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v3

  - name: Test Local Action
    id: test-action
    uses: actions/typescript-action@v1 # Commit with the `v1` tag
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

## Test commits for release

feat: New feature
fix: Fix bug
