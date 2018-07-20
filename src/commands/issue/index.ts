import { Command, flags } from '@oclif/command'

export default class Issue extends Command {
  public static description = 'describe the command here'

  public static flags = {
    // ...Command.flags,
    help: flags.help({ char: 'h' }),
  }

  public async run() {
    this.log(`figure out how to run list command if no command passed`)
  }
}
