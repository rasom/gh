// Info on this pattern: https://www.bennadel.com/blog/3250-defining-functions-with-properties-using-typescript-declaration-merging-in-angular-2-4-9.htm

import * as prettier from 'prettier'
import chalk from 'chalk'

export function log(...msg) {
  console.log(...msg)
}

export namespace log {
  export function query(msg) {
    if (process.env.DEBUG) {
      console.log(
        chalk.black.bgWhiteBright('\nGraphQL Query ===> \n\n'),
        chalk.cyan(prettier.format(msg, { parser: 'graphql' }))
      )
    }
  }

  export function info(...msg) {
    if (process.env.INFO) {
      console.log('Using verbose logging: ', ...msg)
    }
  }

  export function debug(...msg) {
    if (process.env.DEBUG) {
      console.log(chalk.yellow('Using debug logging: \n'), ...msg)
    }
  }
}
