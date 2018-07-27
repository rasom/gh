export const responses = {
  issue: {
    list: {
      all:
        '{"repository":{"issues":{"edges":[{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-01-01T23:07:50Z","number":2,"title":"test2","url":"https://github.com/protoEvangelion/gh/issues/2"}},{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-07-08T02:57:55Z","number":4,"title":"issue 3","url":"https://github.com/protoEvangelion/gh/issues/4"}}],"pageInfo":{"startCursor":"Y3Vyc29yOnYyOpHOEQHfeQ==","hasPreviousPage":true}}}}',
      assignee:
        '{"repository":{"issues":{"edges":[{"node":{"assignees":{"edges":[{"node":{"login":"testuser"}}]},"author":{"login":"protoEvangelion"},"createdAt":"2018-07-20T00:33:01Z","number":9,"title":"test9","url":"https://github.com/protoEvangelion/gh/issues/9"}},{"node":{"assignees":{"edges":[{"node":{"login":"protoEvangelion"}}]},"author":{"login":"protoEvangelion"},"createdAt":"2018-07-26T00:07:29Z","number":10,"title":"node-gh","url":"https://github.com/protoEvangelion/gh/issues/10"}}]}}}',
      base: {
        request: `{repository(owner:"protoevangelion" name:"gh"){issues(first:3){edges{node{author{login}createdAt number title url}}pageInfo{startCursor hasPreviousPage}}}}`,
        response: `{"repository":{"issues":{"edges":[{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-01-01T23:07:36Z","number":1,"title":"test1","url":"https://github.com/protoEvangelion/gh/issues/1"}},{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-01-01T23:07:50Z","number":2,"title":"test2","url":"https://github.com/protoEvangelion/gh/issues/2"}},{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-07-08T02:57:55Z","number":4,"title":"issue 3","url":"https://github.com/protoEvangelion/gh/issues/4"}}],"pageInfo":{"startCursor":"Y3Vyc29yOnYyOpHOEQHfcQ==","hasPreviousPage":false}}}}`,
      },
      detailed:
        '{"repository":{"issues":{"edges":[{"node":{"bodyText":"","url":"https://github.com/protoEvangelion/gh/issues/9","author":{"login":"protoEvangelion"},"createdAt":"2018-07-20T00:33:01Z","number":9,"title":"test9"}},{"node":{"bodyText":"","url":"https://github.com/protoEvangelion/gh/issues/10","author":{"login":"protoEvangelion"},"createdAt":"2018-07-26T00:07:29Z","number":10,"title":"node-gh"}}]}}}',
      label:
        '{"repository":{"issues":{"edges":[{"node":{"labels":{"edges":[{"node":{"name":"bug"}},{"node":{"name":"enhancement"}},{"node":{"name":"good first issue"}},{"node":{"name":"question"}}]},"author":{"login":"protoEvangelion"},"createdAt":"2018-07-20T00:33:01Z","number":9,"title":"test9","url":"https://github.com/protoEvangelion/gh/issues/9"}}]}}}',
      milestone:
        '{"repository":{"issues":{"edges":[{"node":{"milestone":{"title":"Milestone 1"},"author":{"login":"protoEvangelion"},"createdAt":"2018-07-20T00:33:01Z","number":9,"title":"test9","url":"https://github.com/protoEvangelion/gh/issues/9"}},{"node":{"milestone":null,"author":{"login":"protoEvangelion"},"createdAt":"2018-07-26T00:07:29Z","number":10,"title":"node-gh","url":"https://github.com/protoEvangelion/gh/issues/10"}}]}}}',
      state:
        '{"repository":{"issues":{"edges":[{"node":{"author":{"login":"protoEvangelion"},"createdAt":"2018-07-08T02:57:55Z","number":4,"title":"issue 3","url":"https://github.com/protoEvangelion/gh/issues/4"}}]}}}',
    },
  },
}
