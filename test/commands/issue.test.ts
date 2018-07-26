import { expect } from '@oclif/test'
import { responses } from './mock/responses'
import { queries } from './mock/queries'
import { stdout } from './mock/stdout'
import { user, repo } from './mock/user'
import { formatResponse, mapArgsToQuery, requestIssues } from '../../src/commands/issue/list'
import { compressQuery } from '../../src/graphQL'
import { equal } from 'assert'

const mockResponses = responses.issue.list
const mockQueries = queries.issue.list

describe('`issue:list` Maps args to query', () => {
  const remoteInfo = {
    user,
    repo,
    remote: 'origin',
  }

  function generateQuery(flags, paginationCursor?) {
    const query = mapArgsToQuery(
      flags,
      remoteInfo,
      paginationCursor ? true : false,
      paginationCursor
    )

    return compressQuery(query)
  }

  it('builds query for: issue:list', () => {
    expect(generateQuery({})).to.equal(mockQueries.base)
  })

  it('builds query for: issue:list --all', () => {
    expect(generateQuery({ all: true }, 'Y3Vyc29yOnYyOpHOFHDA0A==')).to.equal(mockQueries.all)
  })

  it(`builds query for: issue:list --assignee ${user}`, () => {
    expect(generateQuery({ assignee: user })).to.equal(mockQueries.assignee)
  })

  it('builds query for: issue:list --detailed', () => {
    expect(generateQuery({ detailed: true })).to.equal(mockQueries.detailed)
  })

  it(`builds query for: issue:list --label 'bug,good first issue'`, () => {
    expect(generateQuery({ label: 'bug, good first issue' })).to.contain(mockQueries.label)
  })

  it(`builds query for: issue:list --milestone 'milestone 1'`, () => {
    expect(generateQuery({ milestone: 'milestone 1' })).to.contain(mockQueries.milestone)
  })

  it('builds query for: issue:list --state closed', () => {
    expect(generateQuery({ state: 'closed' })).to.contain(mockQueries.state)
  })
})

describe('GitHub graphQL api works correctly', () => {
  it('returns correct response given base query', async () => {
    const response = await requestIssues(mockResponses.base.request)

    expect(JSON.stringify(response)).to.equal(mockResponses.base.response)
  })
})

describe('`issue:list` Formats/Converts response object correctly for console', () => {
  it('formats response for: issue:list', () => {
    const formattedResponse = formatResponse({}, JSON.parse(mockResponses.base.response))

    expect(formattedResponse).to.equal()
  })
})
