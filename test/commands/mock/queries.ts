export const queries = {
  issue: {
    list: {
      assignee:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(last:1,){edges{node{assignees(first:100){edges{node{login}}}author{login}createdAtnumbertitleurl}}}}}',
      base:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(last:1,){edges{node{author{login}createdAtnumbertitleurl}}}}}',
      detailed:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(last:1,){edges{node{bodyTexturlauthor{login}createdAtnumbertitleurl}}}}}',
      label:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(labels:["bug","goodfirstissue"]last:1,){edges{node{labels(first:100){edges{node{name}}}author{login}createdAtnumbertitleurl}}}}}',
      milestone:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(last:1,){edges{node{milestone{title}author{login}createdAtnumbertitleurl}}}}}',
      state:
        '{repository(owner:"protoEvangelion",name:"gh"){issues(last:1,states:CLOSED){edges{node{author{login}createdAtnumbertitleurl}}}}}',
    },
  },
}
