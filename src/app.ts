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
    throw new Error(`Error when checking if current dir is a git repository: ${e}`)
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

const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})

export const run = async () => {
  await initialize()

  const parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--all|-a] [--assignee|-A] [--user|-u] [--repo|-r] [--state|-S]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: async argv => {
        if (argv.l || argv.list) {
          let issuesArray: object[] = []

          const assignee =
            argv.assignee || argv.A
              ? `
                  assignees(first:100) {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                `
              : ''

          const user = argv.user || argv.u || remoteUser
          const repo = argv.repo || argv.r || remoteRepo
          const state = (argv.state || argv.S || 'OPEN').toUpperCase()

          const isPaginating = argv.all || argv.a

          const generateQuery = (hasPreviousPage?: boolean, endCursor?: string) => {
            let beforeArgument = ''
            let numberOfItems = 1 // 5
            let paginationFields = ''
            let statesArgument = ''

            if (isPaginating) {
              beforeArgument = hasPreviousPage ? `before: "${endCursor}",` : ''
              numberOfItems = 2 // 100
              statesArgument = `states: ${state}`

              paginationFields = `
                pageInfo {
                  startCursor
                  hasPreviousPage
                }
              `
            }

            return `{
              repository(
                owner: "${user}",
                name: "${repo}"
              ) {
                issues(
                  last: ${numberOfItems},
                  ${beforeArgument}
                  ${statesArgument}
                ) {
                  edges {
                    node {
                      ${assignee}
                      createdAt
                      number
                      title
                      url
                    }
                  }
                  ${paginationFields}
                }
              }
            }`
          }

          try {
            const response: any = await client.request(generateQuery())
            const issues = response.repository.issues

            issuesArray = issues.edges

            if (isPaginating) {
              let hasPreviousPage = issues.pageInfo.hasPreviousPage
              let startCursor = issues.pageInfo.startCursor
              let temp

              while (hasPreviousPage) {
                try {
                  temp = await client.request(generateQuery(hasPreviousPage, startCursor))

                  hasPreviousPage = temp.repository.issues.pageInfo.hasPreviousPage
                  startCursor = temp.repository.issues.pageInfo.startCursor

                  issuesArray.push(...temp.repository.issues.edges)
                } catch (e) {
                  throw new Error(`Error when paginating issues: ${e}`)
                }
              }
            } else {
              console.log('not paginating')
            }
          } catch (e) {
            throw new Error(`Error making initial issues request: ${e}`)
          }

          console.log('issuesArray', issuesArray)
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
