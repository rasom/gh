'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var yargs = require('yargs')
var graphql_request_1 = require('graphql-request')
var client = new graphql_request_1.GraphQLClient(
  'https://api.github.com/graphql',
  {
    headers: {
      Authorization: 'Bearer '
    }
  }
)
exports.run = function () {
  var parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--owner|-o]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: function (argv) {
        if (argv.l || argv.list) {
          var query =
            'query($owner: String!) {\n            repository(owner:$owner, name:"gh") {\n              issues(last:100, states:OPEN) {\n                edges {\n                  node {\n                    title\n                    url\n                  }\n                }\n              }\n            }\n          }'
          var variables = {
            owner: argv.owner || argv.o
          }
          client.request(query, variables).then(function (data) {
            return console.log('data', data.repository.issues.edges)
          })
          console.log('list')
        }
      }
    })
    .help().argv
  console.log('parsedArgs', parsedArgs)
}
