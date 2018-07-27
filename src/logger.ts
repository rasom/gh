// Info on this pattern: https://www.bennadel.com/blog/3250-defining-functions-with-properties-using-typescript-declaration-merging-in-angular-2-4-9.htm

import * as prettier from 'prettier'
import ctx from 'chalk'
import { config } from './config'

export const chalk = new ctx.constructor({ enabled: config.color })

export function log(...messages) {
  if (process.env.NODE_ENV !== 'testing') {
    messages.forEach(msg => {
      console.log(msg.trim(), '\n')
    })
  }
}

export namespace log {
  export function query(msg) {
    if (process.env.DEBUG === 'true') {
      console.log(
        chalk.black.bgWhiteBright('\nGraphQL Query ===> \n\n'),
        chalk.cyan(prettier.format(msg, { parser: 'graphql' }))
      )
    }
  }

  export function info(...msg) {
    if (process.env.INFO === 'true') {
      console.log('Using verbose logging: ', ...msg)
    }
  }

  export function debug(...msg) {
    if (process.env.DEBUG === 'true') {
      console.log(
        chalk.yellow('Debug ============ > \n\n'),
        ...msg,
        chalk.yellow('\n======================')
      )
    }
  }
}
