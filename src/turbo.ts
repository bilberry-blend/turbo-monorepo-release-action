// Turbo --dry=json output
/*
{
  "id": "2WwGOHNo7ZvZWUkr2zjoHI2UiBQ",
  "version": "1",
  "turboVersion": "1.10.15",
  "monorepo": true,
  "globalCacheInputs": {
    "rootKey": "You don't understand! I coulda had class. I coulda been a contender. I could've been somebody, instead of a bum, which is what I am.",
    "files": {
      "apps/my-page/.env.local": "0fca0b83cace2f20f74fff799ae5eb0e8cb569ad",
      "apps/widgets/.env.local": "6205394622e314e7581892c510e83c93ca4c709f"
    },
    "hashOfExternalDependencies": "c57ef12f27f503e0",
    "globalDotEnv": null,
    "environmentVariables": {
      "specified": {
        "env": [],
        "passThroughEnv": null
      },
      "configured": [],
      "inferred": [],
      "passthrough": null
    }
  },
  "packages": [
    "widgets"
  ],
  "envMode": "infer",
  "frameworkInference": true,
  "tasks": [
    {
      "taskId": "widgets#build",
      "task": "build",
      "package": "widgets",
      "hash": "86395906b551f9c7",
      "inputs": {
        "vite.config.ts": "4b390a674f60d4e1402c2e2baa2e02759b200f07"
      },
      "hashOfExternalDependencies": "072a8b8c73cf184f",
      "cache": {
        "local": false,
        "remote": false,
        "status": "MISS",
        "timeSaved": 0
      },
      "command": "vite build",
      "cliArguments": [],
      "outputs": [
        "dist/**"
      ],
      "excludedOutputs": null,
      "logFile": "apps/widgets/.turbo/turbo-build.log",
      "directory": "apps/widgets",
      "dependencies": [],
      "dependents": [],
      "resolvedTaskDefinition": {
        "outputs": [
          "dist/**"
        ],
        "cache": true,
        "dependsOn": [
          "^build"
        ],
        "inputs": [],
        "outputMode": "full",
        "persistent": false,
        "env": [],
        "passThroughEnv": null,
        "dotEnv": null
      },
      "expandedOutputs": [],
      "framework": "vite",
      "envMode": "loose",
      "environmentVariables": {
        "specified": {
          "env": [],
          "passThroughEnv": null
        },
        "configured": [],
        "inferred": [],
        "passthrough": null
      },
      "dotEnv": null
    }
  ],
  "user": "",
  "scm": {
    "type": "git",
    "sha": "671d07e5bdfe1a7a626f701507565920e82308e4",
    "branch": "feat/make-release-notes-when-deploy-to-prod"
  }
}

*/
export interface DryRunJson {
  id: string
  version: string
  turboVersion: string
  monorepo: boolean
  globalCacheInputs: {
    rootKey: string
    files: Record<string, string>
    hashOfExternalDependencies: string
    globalDotEnv: any
    environmentVariables: {
      specified: {
        env: string[]
        passThroughEnv: any
      }
      configured: any[]
      inferred: any[]
      passthrough: any
    }
  }
  packages: string[]
  envMode: string
  frameworkInference: boolean
  tasks: {
    taskId: string
    task: string
    package: string
    hash: string
    inputs: Record<string, string>
    hashOfExternalDependencies: string
    cache: {
      local: boolean
      remote: boolean
      status: string
      timeSaved: number
    }
    command: string
    cliArguments: string[]
    outputs: string[]
    excludedOutputs: any
    logFile: string
    directory: string
    dependencies: any[]
    dependents: any[]
    resolvedTaskDefinition: {
      outputs: string[]
      cache: boolean
      dependsOn: string[]
      inputs: any[]
      outputMode: string
      persistent: boolean
      env: any[]
      passThroughEnv: any
      dotEnv: any
    }
    expandedOutputs: any[]
    framework: string
    envMode: string
    environmentVariables: {
      specified: {
        env: string[]
        passThroughEnv: any
      }
      configured: any[]
      inferred: any[]
      passthrough: any
    }
    dotEnv: any
  }[]
  user: string
  scm: {
    type: string
    sha: string
    branch: string
  }
}
