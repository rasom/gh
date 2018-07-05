import * as yargs from 'yargs'
import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: 'Bearer ',
  },
})

export const run = (): void => {
  const parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--owner|-o]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: argv => {
        if (argv.l || argv.list) {
          const query = `query($owner: String!) {
            repository(owner:$owner, name:"gh") {
              issues(last:100, states:OPEN) {
                edges {
                  node {
                    title
                    url
                  }
                }
              }
            }
          }`

          const variables = {
            owner: argv.owner || argv.o,
          }

          client
            .request(query, variables)
            .then(data => console.log('data', data.repository.issues.edges))

          console.log('list')
        }
      },
    })
    .help().argv

  console.log('parsedArgs', parsedArgs)
}
