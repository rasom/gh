import * as yargs from 'yargs'
import chalk from 'chalk'
import { GraphQLClient } from 'graphql-request'
import * as fs from 'fs'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise/index'
import { find } from 'lodash'
import * as moment from 'moment'

const log = console.log

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
                      author {
                        login
                      }
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

          interface IRepoIssues {
            repository: {
              issues: {
                edges: object[]
                pageInfo: {
                  hasPreviousPage: boolean
                  startCursor: string
                }
              }
            }
          }

          const getIssues = async (issues?, firstCall?: boolean) => {
            let response

            if (issues) {
              printIssues(issues)

              if (!issues.pageInfo) {
                return

                if (!issues.pageInfo.hasPreviousPage) {
                  return
                }
              }
            }

            if (firstCall) {
              response = await client.request<IRepoIssues>(generateQuery())
            } else {
              response = await client.request<IRepoIssues>(
                generateQuery(issues.pageInfo.hasPreviousPage, issues.pageInfo.startCursor)
              )
            }

            getIssues({
              edges: response.repository.issues.edges,
              pageInfo: response.repository.issues.pageInfo,
            })
          }

          const printIssues = issues => {
            let dateCreated
            let node

            console.log('issues', issues)

            const issuesLength = issues.edges.length - 1

            for (let i = issuesLength; i >= 0; i--) {
              node = issues.edges[i].node
              dateCreated = moment(node.createdAt).fromNow()

              log(
                chalk.green(`#${node.number}`),
                node.title,
                chalk.magenta(`@${node.author.login} (${dateCreated})`)
              )
            }
          }

          try {
            getIssues(null, true)
          } catch (e) {
            throw new Error(`Error making initial issues request: ${e}`)
          }
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
