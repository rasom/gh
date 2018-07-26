export const responses = {
  issue: {
    list: {
      base: {
        request: `{repository(owner:"protoEvangelion",name:"gh"){issues(first:1){edges{node{author{login}createdAt number title url}}}}}`,
        response: `{"repository":{"issues":{"edges":[{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-01-01T23:07:36Z","number":1,"title":"test1","url":"https://github.com/protoEvangelion/gh/issues/1"}}]}}}`,
      },
    },
  },
}
