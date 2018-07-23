// https://oclif.io/docs/base_class.html

import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'
import Command, { flags } from '@oclif/command'
import { log } from './logger'
import { config } from './config'

const git = simpleGit()

export default abstract class extends Command {
  public static flags = {
    debug: flags.boolean({
      description: 'A more complete info flag, which leaks more privacy sensitive data by default.',
    }),
    info: flags.boolean({
      description: 'The info flag is useful for basic debugging',
    }),
    remote: flags.string({
      description: 'Override the default_remote setting in ~/.default.gh.json',
    }),
    repo: flags.string({ char: 'r', description: 'The repo to fetch issues from' }),
    user: flags.string({ char: 'u', description: 'The owner of the repository' }),
  }

  public flags
  public remoteUser
  public remoteRepo

  public async init() {
    try {
      var isGitRepo = await git.checkIsRepo()
    } catch (e) {
      throw new Error(`Error when checking if current dir is a git repository: ${e}`)
    }

    if (!isGitRepo) {
      throw new Error('Current directory is not a git repo')
    }

    this.setGlobalFlags()
    this.initLogger()

    await this.setUserAndRepo()
  }

  private initLogger() {
    process.env.DEBUG = this.flags.debug
    process.env.INFO = this.flags.info
  }

  private setGlobalFlags() {
    // @ts-ignore: need to figure out if this error is benign
    const { flags } = this.parse(this.constructor)

    this.flags = flags
  }

  private async setUserAndRepo() {
    // TODO: add default remote to config https://github.com/node-gh/gh/issues/85
    try {
      var remotesArr = await git.getRemotes(true)
    } catch (e) {
      throw new Error(`Error when looking up your local git remotes: ${e}`)
    }

    const remoteName = this.flags.remote || config.default_remote || 'origin'

    try {
      // @ts-ignore: https://github.com/steveukx/git-js/pull/283
      var remote = find(remotesArr, { name: remoteName }).refs.fetch
    } catch (e) {
      throw new Error(
        `No remote with name: ${remoteName}. Try adding one with \`git remote add origin your_repo_fetch_url\``
      )
    }

    // @ts-ignore: https://github.com/steveukx/git-js/pull/283
    if (remotesArr.length === 1) {
      remote = remotesArr[0].refs.fetch
    }

    this.remoteUser = remote.match('github[.]com.(.*)/')![1]
    this.remoteRepo = remote.match(`${this.remoteUser}/(.*)[.]git`)![1]

    log.debug(
      `Remote: ${remoteName} \n`,
      `Repo: ${this.remoteRepo} \n`,
      `Owner: ${this.remoteUser} \n`
    )
  }
}
