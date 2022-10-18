/* eslint-disable no-await-in-loop, no-restricted-syntax */
import execa, { ExecaChildProcess, Options } from 'execa';
import chalk from 'chalk';

const logger = console;

type StepOptions = {
  startMessage?: string;
  errorMessage?: string;
  dryRun?: boolean;
  debug?: boolean;
  signal?: AbortSignal;
};

export const exec = async (
  command: string | string[],
  options: Options = {},
  { startMessage, errorMessage, dryRun, debug, signal }: StepOptions = {}
): Promise<void> => {
  logger.info();
  if (startMessage) logger.info(startMessage);

  if (dryRun) {
    logger.info(`\n> ${command}\n`);
    return undefined;
  }

  const defaultOptions: Options = {
    shell: true,
    stdout: debug ? 'inherit' : 'pipe',
    stderr: debug ? 'inherit' : 'pipe',
  };
  let currentChild: ExecaChildProcess;

  // Newer versions of execa have explicit support for abort signals, but this works
  if (signal) {
    signal.addEventListener('abort', () => currentChild.kill());
  }

  try {
    if (typeof command === 'string') {
      logger.debug(`> ${command}`);
      currentChild = execa.command(command, { ...defaultOptions, ...options });
      await currentChild;
    } else {
      for (const subcommand of command) {
        logger.debug(`> ${subcommand}`);
        currentChild = execa.command(subcommand, { ...defaultOptions, ...options });
        await currentChild;
      }
    }
  } catch (err) {
    if (!err.killed) {
      logger.error(chalk.red(`An error occurred while executing: \`${command}\``));
      logger.log(`${errorMessage}\n`);
    }

    throw err;
  }

  return undefined;
};
