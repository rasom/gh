import { expect, test } from '@oclif/test'
import { queries } from './mock/queries'
import { user, repo } from './mock/user'
import {} from '../../src/commands/issue/list'
const { assignee, base, detailed, label, milestone, state } = queries.issue.list

describe('`issue:list` Maps user args to graphQL query', () => {
  test
    .stdout()
    .command(['issue:list', '-u', user, '-r', repo])
    .it('runs issue:list', output => {
      expect(output.stdout).to.contain(base.query)
    })

  test
    .stdout()
    .command(['issue:list', '-A', user, '-u', user, '-r', repo])
    .it(`runs issue:list --assignee ${user}`, output => {
      expect(output.stdout).to.contain(assignee)
    })

  test
    .stdout()
    .command(['issue:list', '-d', '-u', user, '-r', repo])
    .it(`runs issue:list --detailed`, output => {
      expect(output.stdout).to.contain(detailed)
    })

  test
    .stdout()
    .command(['issue:list', '-L', 'bug,good first issue', '-u', user, '-r', repo])
    .it(`runs issue:list --label 'bug,good first issue'`, output => {
      expect(output.stdout).to.contain(label)
    })

  test
    .stdout()
    .command(['issue:list', '-M', 'milestone 1', '-u', user, '-r', repo])
    .it(`runs issue:list --milestone 'milestone 1'`, output => {
      expect(output.stdout).to.contain(milestone)
    })

  test
    .stdout()
    .command(['issue:list', '-S', 'closed', '-u', user, '-r', repo])
    .it(`runs issue:list --state closed`, output => {
      expect(output.stdout).to.contain(state)
    })

  test
    .stdout()
    .command(['issue:list', '-S', 'closed', '-u', user, '-r', repo])
    .it(`runs issue:list --state closed`, output => {
      expect(output.stdout).to.contain(state)
    })
})

describe('`issue:list` Maps query to request', () => {})

// describe('`issue:list` Maps query to request', () => {
//   test.nock('https://api.github.com', api =>
//     api
//       .post('/graphql')
//       .reply(200, [
//         { access_token: { token: 'somethingelse' } },
//         { access_token: { token: 'foobar', expires_in: 60 } },
//         {},
//       ])
//   )
// })
