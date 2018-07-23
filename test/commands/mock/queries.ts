import { config } from '../../../src/config'

const { node_limit } = config.graphql

export const queries = {
  issue: {
    list: {
      assignee: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{assignees(first:100){edges{node{login}}}author{login}createdAtnumbertitleurl}}}}}`,
      base: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{author{login}createdAtnumbertitleurl}}}}}`,
      detailed: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{bodyTexturlauthor{login}createdAtnumbertitleurl}}}}}`,
      label: `{repository(owner:"protoEvangelion",name:"gh"){issues(labels:["bug","goodfirstissue"]last:${node_limit},){edges{node{labels(first:100){edges{node{name}}}author{login}createdAtnumbertitleurl}}}}}`,
      milestone: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},){edges{node{milestone{title}author{login}createdAtnumbertitleurl}}}}}`,
      state: `{repository(owner:"protoEvangelion",name:"gh"){issues(last:${node_limit},states:CLOSED){edges{node{author{login}createdAtnumbertitleurl}}}}}`,
    },
  },
}
