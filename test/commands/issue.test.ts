import { expect, test } from '@oclif/test'

describe('issue', () => {
  test
    .stdout()
    .command(['issue:list', '-u', 'protoevangelion', '-r', 'gh'])
    .it('runs issue:list', output => {
      expect(output.stdout).to.contain(
        '{repository(owner:"protoevangelion",name:"gh"){issues(last:1,){edges{node{author{login}createdAtnumbertitleurl}}}}}'
      )
    })
})
