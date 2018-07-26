import { config } from '../../../src/config'
import { user, repo } from './user'

const { node_limit } = config.graphql

export const queries = {
  issue: {
    list: {
      all: `{repository(owner:"${user}",name:"${repo}"){issues(before:"Y3Vyc29yOnYyOpHOFHDA0A==",last:${node_limit},){edges{node{author{login}createdAt number title url}}pageInfo{startCursor hasPreviousPage}}}}`,
      assignee: `{repository(owner:"${user}",name:"${repo}"){issues(last:${node_limit},){edges{node{assignees(first:100){edges{node{login}}}author{login}createdAt number title url}}}}}`,
      base: `{repository(owner:"${user}",name:"${repo}"){issues(last:${node_limit},){edges{node{author{login}createdAt number title url}}}}}`,
      detailed: `{repository(owner:"${user}",name:"${repo}"){issues(last:${node_limit},){edges{node{bodyText url author{login}createdAt number title url}}}}}`,
      label: `{repository(owner:"${user}",name:"${repo}"){issues(labels:["bug","good first issue"]last:${node_limit},){edges{node{labels(first:100){edges{node{name}}}author{login}createdAt number title url}}}}}`,
      milestone: `{repository(owner:"${user}",name:"${repo}"){issues(last:${node_limit},){edges{node{milestone{title}author{login}createdAt number title url}}}}}`,
      state: `{repository(owner:"${user}",name:"${repo}"){issues(last:${node_limit},states:CLOSED){edges{node{author{login}createdAt number title url}}}}}`,
    },
  },
}
