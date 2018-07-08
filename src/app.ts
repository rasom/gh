import * as yargs from 'yargs'
import { GraphQLClient } from 'graphql-request'
import * as fs from 'fs'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'

const git = simpleGit()

let remoteUser
let remoteRepo

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

  remoteUser = remote.match('github[.]com.(.*)/')[1]
  remoteRepo = remote.match(`${remoteUser}/(.*)[.]git`)[1]
}

const config = JSON.parse(
  fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }),
)

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})

export const run = async () => {
  await initialize()

  const parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--owner|-u] [--repo|-r] [--state|-S]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: async argv => {
        if (argv.l || argv.list) {
          const user = argv.user || argv.u || remoteUser
          const repo = argv.repo || argv.r || remoteRepo
          const state =
            argv.state.toUpperCase() || argv.S.toUpperCase() || 'OPEN'

          const query = `{
            repository(owner: "${user}", name: "${repo}") {
              issues(last:5, states: ${state}) {
                edges {
                  node {
                    createdAt
                    number
                    title
                    state
                    url
                  }
                }
              }
            }
          }`

          console.log('query', query)

          try {
            const issues: any = await client.request(query)
            console.log('issues', issues.repository.issues.edges)
          } catch (e) {
            throw new Error(`Error making request to GitHub GraphQL API: ${e}`)
          }
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
