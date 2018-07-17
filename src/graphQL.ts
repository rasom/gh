import * as fs from 'fs'
import * as userhome from 'userhome'

import { GraphQLClient } from 'graphql-request'
const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))

export const graphQL = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})
