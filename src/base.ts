// https://oclif.io/docs/base_class.html

import * as fs from 'fs'
import { GraphQLClient } from 'graphql-request'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'
import Command, { flags } from '@oclif/command'

export default abstract class extends Command {
  public static flags = {
    loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] }),
  }

  public log(msg, level) {
    switch (this.flags.loglevel) {
      case 'error':
        if (level === 'error') console.error(msg)
        break
      case 'warn':
        if (level === 'warn') console.warn(msg)
        break
      case 'info':
        if (level === 'info') console.log(msg)
        break
      case 'debug':
        if (level === 'error') console.error(msg)
        break
      default:
        console.log(msg)
    }
  }

  public async init(err) {
    let remoteUser
    let remoteRepo
    let isGitRepo
    let remotes

    const git = simpleGit()

    try {
      isGitRepo = await git.checkIsRepo()
    } catch (e) {
      throw new Error(`Error when checking if current dir is a git repository: ${e}`)
    }

    if (!isGitRepo) {
      throw new Error('Current directory is not a git repo')
    }

    try {
      remotes = await git.getRemotes(true)
    } catch (e) {
      throw new Error(`Error when looking up your local git remotes: ${e}`)
    }

    let remote = find(remotes, { name: 'origin' }).refs.fetch

    if (!remote || remotes.length === 1) {
      remote = remotes[0].refs.fetch
    }

    remoteUser = remote.match('github[.]com.(.*)/')[1]
    remoteRepo = remote.match(`${remoteUser}/(.*)[.]git`)[1]

    const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))

    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${config.github_token}`,
      },
    })

    const { flags } = this.parse(this.constructor)

    this.remoteUser = remoteUser
    this.remoteRepo = remoteRepo
    this.client = client
    this.flags = flags
  }
  public async catch(err) {
    // handle any error from the command
  }
  public async finally(err) {
    // called after run and catch regardless of whether or not the command errored
  }
}
