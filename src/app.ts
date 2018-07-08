import * as yargs from 'yargs'
import { GraphQLClient } from 'graphql-request'
import * as fs from 'fs'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'

const git = simpleGit()

// let remoteUser
// let remoteRepo

async function initialize() {
  let isGitRepo
  let remotes

  try {
    isGitRepo = await git.checkIsRepo()
  } catch (e) {
    throw new Error(
      `Error when checking if current dir is a git repository: ${e}`,
    )
  }

  if (!isGitRepo) {
    throw new Error('Current directory is not a git repo')
  }

  try {
    remotes = await git.getRemotes(true)
  } catch (e) {
    throw new Error(`Error when looking up your local git remotes: ${e}`)
  }

  let remote = find(remotes, { name: 'origin' }).refs.fetch

  if (!remote || remotes.length === 1) {
    remote = remotes[0].refs.fetch
  }

  const userOrOrg = remote.match('github[.]com.(.*)/')[1]
  const repo = remote.match(`${userOrOrg}/(.*)[.]git`)[1]

  console.log('userOrOrg', userOrOrg, repo)
}

initialize()

const config = JSON.parse(
  fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }),
)

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})

export const run = (): void => {
  const parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--owner|-o]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: argv => {
        if (argv.l || argv.list) {
          const query = `query($owner: String!) {
            repository(owner:$owner, name:"gh") {
              issues(last:100, states:OPEN) {
                edges {
                  node {
                    title
                    url
                  }
                }
              }
            }
          }`

          const variables = {
            owner: argv.owner || argv.o,
            // owner: 'node-gh',
          }

          client
            .request(query, variables)
            .then((data: any) =>
              console.log('data', data.repository.issues.edges),
            )

          console.log('list')
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
