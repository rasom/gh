import { config } from '../../../src/config'

const { node_limit } = config.graphql

export const queries = {
  issue: {
    list: {
      assignee: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{assignees(first:100){edges{node{login}}}author{login}createdAtnumbertitleurl}}}}}`,
      base: {
        query: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{author{login}createdAtnumbertitleurl}}}}}`,
        response:
          '{"repository":{"issues":{"edges":[{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-07-11T04:42:56Z","number":8,"title":"test8","url":"https://github.com/protoEvangelion/gh/issues/8"}},{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-07-20T00:33:01Z","number":9,"title":"test9","url":"https://github.com/protoEvangelion/gh/issues/9"}}]}}}\n',
      },
      detailed: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{bodyTexturlauthor{login}createdAtnumbertitleurl}}}}}`,
      label: `{repository(owner:"protoEvangelion",name:"gh"){issues(labels:["bug","goodfirstissue"]last:${node_limit},){edges{node{labels(first:100){edges{node{name}}}author{login}createdAtnumbertitleurl}}}}}`,
      milestone: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{milestone{title}author{login}createdAtnumbertitleurl}}}}}`,
      state: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},states:CLOSED){edges{node{author{login}createdAtnumbertitleurl}}}}}`,
    },
  },
}
