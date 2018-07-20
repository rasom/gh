import { flags } from '@oclif/command'
import Command from '../../base'
import { IRepoIssues } from '../../interfaces'
import chalk from 'chalk'
import * as moment from 'moment'
import { graphQL } from '../../graphQL'

export default class List extends Command {
  public static description = 'describe the command here'

  public static flags = {
    help: flags.help({ char: 'h' }),
    assignee: flags.string({ char: 'A', description: 'Filter by assignee' }),
    all: flags.boolean({ char: 'a', description: 'List all issues' }),
    description: flags.boolean({ char: 'd', description: 'Show detailed version of issue' }),
    repo: flags.string({ char: 'r', description: 'The repo to fetch issues from' }),
    state: flags.string({ char: 'S', description: 'Filter by closed or open issues' }),
    user: flags.string({ char: 'u', description: 'The owner of the repository' }),
  }

  public async run() {
    const { flags } = this.parse(List)
    const user = flags.user || this.remoteUser
    const repo = flags.repo || this.remoteRepo
    const state = (flags.state || 'OPEN').toUpperCase()

    const isPaginating = flags.all

    const assigneeField = flags.assignee
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

    const descriptionField = flags.description
      ? `
          bodyText
          url
        `
      : ''

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

      return `
        {
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
                  ${assigneeField}
                  author {
                    login
                  }
                  createdAt
                  ${descriptionField}
                  number
                  title
                  url
                }
              }
              ${paginationFields}
            }
          }
        }
      `
    }

    const getIssues = async (issues?, firstCall?: boolean) => {
      let response

      if (issues) {
        printIssues(issues)

        if (!issues.pageInfo) {
          return
        }

        if (!issues.pageInfo.hasPreviousPage) {
          return
        }
      }

      if (firstCall) {
        response = await graphQL.request<IRepoIssues>(generateQuery())
      } else {
        response = await graphQL.request<IRepoIssues>(
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
      let formattedIssue

      const issuesLength = issues.edges.length - 1

      for (let i = issuesLength; i >= 0; i--) {
        node = issues.edges[i].node
        dateCreated = moment(node.createdAt).fromNow()

        formattedIssue = `${chalk.green(`#${node.number}`)} ${node.title} ${chalk.magenta(
          `@${node.author.login} (${dateCreated})`
        )}`

        if (flags.description) {
          formattedIssue = `
            ${formattedIssue}
            ${node.bodyText}
            ${node.url}
          `.replace(/^\s+|\s+$/gm, '')
        }

        this.log(formattedIssue, '\n')
      }
    }

    try {
      getIssues(null, true)
    } catch (e) {
      throw new Error(`Error making initial issues request: ${e}`)
    }
  }
}
