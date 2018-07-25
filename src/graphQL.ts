// import { GraphQLClient } from 'graphql-request'
import { config } from './config'
import 'cross-fetch/polyfill'

// export const graphQL = new GraphQLClient('https://api.github.com/graphql', {
//   headers: {
//     Authorization: `Bearer ${config.github_token}`,
//   },
// })

// const obj = `{
//   repository(owner: "protoEvangelion", name: "gh") {
//     issues(last: 5) {
//       edges {
//         node {
//           url
//         }
//       }
//     }
//   }
// }`

const loadOptions = query => ({
  method: 'POST',
  headers: { authorization: `Bearer ${config.github_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
  }),
})

export const request = async query => {
  try {
    var response = await fetch('https://api.github.com/graphql', loadOptions(query))
  } catch (e) {
    throw new Error(`Error awaiting GitHub response`)
  }

  try {
    var result = await getResult(response)
    console.log('result', result)
  } catch (e) {
    throw new Error(`Error awaiting GitHub result ${e}`)
  }

  return result.data ? result.data : result
}

async function getResult(response): Promise<any> {
  const contentType = response.headers.get('Content-Type')
  if (contentType && contentType.startsWith('application/json')) {
    return response.json()
  } else {
    return response.text()
  }
}
