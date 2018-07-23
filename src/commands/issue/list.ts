import { flags } from '@oclif/command'
import Command from '../../base'
import { IRepoIssues } from '../../interfaces'
import chalk from 'chalk'
import * as moment from 'moment'
import { graphQL } from '../../graphQL'
import { log } from '../../logger'
import { config } from '../../config'

export default class List extends Command {
  public static description = 'List & filter issues'

  public static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    all: flags.boolean({ char: 'a', description: 'List all issues' }),
    assignee: flags.string({
      char: 'A',
      description: 'Filter issues by assignee(case sensitive) login id',
    }),
    detailed: flags.boolean({ char: 'd', description: 'Show detailed version of issues' }),
    label: flags.string({
      char: 'L',
      description: 'Filter issues by label(s). If multiple labels they should be comma separated',
    }),
    milestone: flags.string({
      char: 'M',
      description: 'Filter issues by milestone (case insensitive)',
    }),
    state: flags.string({ char: 'S', description: 'Filter by closed or open issues' }),
  }

  public async run() {
    const { flags } = this.parse(List)
    const user = flags.user || this.remoteUser
    const repo = flags.repo || this.remoteRepo
    const state = (flags.state || 'OPEN').toLocaleUpperCase()

    function generateQuery(hasPreviousPage?: boolean, endCursor?: string) {
      let assigneeField = ''
      let beforeArgument = ''
      let detailedField = ''
      let labelsArgument = ''
      let labelsField = ''
      let milestoneField = ''
      let numberOfItems = config.graphql.node_limit
      let paginationFields = ''
      let statesArgument = ''

      if (flags.all) {
        beforeArgument = hasPreviousPage ? `before: "${endCursor}",` : ''
        numberOfItems = config.graphql.pagination_node_limit

        paginationFields = `
          pageInfo {
            startCursor
            hasPreviousPage
          }
        `
      }

      if (flags.assignee) {
        assigneeField = `
          assignees(first: 100) {
            edges {
              node {
                login
              }
            }
          }
        `
      }

      if (flags.detailed) {
        detailedField = `
          bodyText
          url
        `
      }

      if (flags.label) {
        const labelsArr = flags.label.split(',').map(label => `"${label}"`)
        labelsArgument = `labels: [${labelsArr}]`

        labelsField = `
          labels(first: 100) {
            edges {
              node {
                name
              }
            }
          }
        `
      }

      if (flags.milestone) {
        milestoneField = `
          milestone {
            title
          }
        `
      }

      if (flags.state) {
        statesArgument = `states: ${state}`
      }

      return `
        {
          repository(
            owner: "${user}",
            name: "${repo}"
          ) {
            issues(
              ${beforeArgument}
              ${labelsArgument}
              last: ${numberOfItems},
              ${statesArgument}
            ) {
              edges {
                node {
                  ${assigneeField}
                  ${detailedField}
                  ${labelsField}
                  ${milestoneField}

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
        }
      `
    }

    let response
    let query

    // Recursive function to handle pagination
    async function getIssues(issues?, firstCall?: boolean) {
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
        query = generateQuery()

        log.query(query)

        response = await graphQL.request<IRepoIssues>(query)
      } else {
        query = generateQuery(issues.pageInfo.hasPreviousPage, issues.pageInfo.startCursor)

        // log.query(query)

        response = await graphQL.request<IRepoIssues>(query)
      }

      getIssues({
        edges: response.repository.issues.edges,
        pageInfo: response.repository.issues.pageInfo,
      })
    }

    function printIssues(issues) {
      let dateCreated
      let node
      let formattedIssue
      const trimSpaces = /^\s+|\s+$/gm

      const issuesLength = issues.edges.length - 1

      for (let i = issuesLength; i >= 0; i--) {
        node = issues.edges[i].node

        if (flags.assignee) {
          const assignees = node.assignees.edges.filter(
            assignee => assignee.node.login === flags.assignee
          )

          if (assignees.length === 0) {
            continue
          }
        }

        if (flags.label) {
          // Check if issue contains ALL labels passed in
          const labels: string[] = flags.label.split(',')
          const returnedLabels: string = node.labels.edges.map(label => label.node.name).join(',')
          const issueContainsLabels: boolean = labels.every(label => returnedLabels.includes(label))

          if (!issueContainsLabels) {
            continue
          }
        }

        if (flags.milestone) {
          if (!node.milestone) {
            continue
          }

          if (node.milestone.title.toLocaleUpperCase() !== flags.milestone.toLocaleUpperCase()) {
            continue
          }
        }

        dateCreated = moment(node.createdAt).fromNow()

        formattedIssue = `${chalk.green(`#${node.number}`)} ${node.title} ${chalk.magenta(
          `@${node.author.login} (${dateCreated})`
        )}`

        if (flags.detailed) {
          formattedIssue = `
            ${formattedIssue}
            ${node.bodyText}
            ${chalk.cyan(node.url)}
          `
        }

        log(formattedIssue.replace(trimSpaces, ''), '\n')
      }
    }

    try {
      getIssues(null, true)
    } catch (e) {
      throw new Error(`Error making initial issues request: ${e}`)
    }
  }
}
