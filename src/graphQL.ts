import { GraphQLClient } from 'graphql-request'
import { config } from './config'

export const graphQL = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})
