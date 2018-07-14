import * as yargs from 'yargs'
import * as chalk from 'chalk'
import { GraphQLClient } from 'graphql-request'
import * as fs from 'fs'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise'
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

          let edges
          let pageInfo
          let response

          try {
            if (isPaginating) {
              response = await client.request<IRepoIssues>(generateQuery())
              edges = response.repository.issues.edges
              pageInfo = response.repository.issues.pageInfo
              console.log('edges.length', edges.length)
              let dateCreated
              let node

              for (let i = edges.length - 1; i >= 0; i--) {
                node = edges[i].node
                dateCreated = moment(node.createdAt).fromNow()
                log(
                  chalk.green(`#${node.number}`),
                  node.title,
                  chalk.magenta(`@${node.author.login} (${dateCreated})`)
                )
              }

              let hasPreviousPage = pageInfo.hasPreviousPage
              let startCursor = pageInfo.startCursor

              while (hasPreviousPage) {
                try {
                  response = await client.request<IRepoIssues>(
                    generateQuery(hasPreviousPage, startCursor)
                  )
                  edges = response.repository.issues.edges
                  pageInfo = response.repository.issues.pageInfo

                  hasPreviousPage = pageInfo.hasPreviousPage
                  startCursor = pageInfo.startCursor

                  console.log(edges)
                } catch (e) {
                  throw new Error(`Error when paginating issues: ${e}`)
                }
              }
            } else {
              response = await client.request<IRepoIssues>(generateQuery())
              edges = response.repository.issues.edges

              for (let i = edges.length; i > 0; i--) {
                log(edges[i])
              }

              console.log('not paginating', edges)
            }
          } catch (e) {
            throw new Error(`Error making initial issues request: ${e}`)
          }
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
