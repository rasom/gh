import { GraphQLClient } from 'graphql-request'
import { config } from './config'

export const graphQL = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${config.github_token}`,
  },
})

/**
 * Compress query by stripping duplicate whitespace, and whitespace adjacent to
 * brackets, braces, parentheses, colons, and commas.
 * https://github.com/jeromecovington/graphql-compress/blob/master/index.js
 *
 */
export function compressQuery(text: string): string {
  const query = text.replace(/\s+/g, ' ')
  return query.replace(/\s*(\[|\]|\{|\}|\(|\)|:|\,)\s*/g, '$1')
}
