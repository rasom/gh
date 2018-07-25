import { expect, test } from '@oclif/test'
import { queries } from './mock/queries'
import { user, repo } from './mock/user'
const { assignee, base, detailed, label, milestone, state } = queries.issue.list

import List from '../../src/commands/issue/list'

xdescribe('issue', () => {
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

describe('issue', () => {
  test
    .nock('https://api.github.com', api => api.post('/graphql').reply(200, base.response))
    .stdout()
    .do(async () => {
      await List.hi('msg')
    })
    .do(ctx => expect(ctx.stdout).to.equal('json output: {"a":"foobar"}\n'))
    .it('uses util.format()')
})
