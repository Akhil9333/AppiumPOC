import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { pathToFileURL } from 'node:url';

const supportedScenarios = new Set(['screening', 'screening-negative']);
const scenario = process.argv[2];

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!supportedScenarios.has(scenario)) {
    console.error('Choose a screening scenario: screening or screening-negative.');
    process.exitCode = 1;
  } else {
    run().catch(error => {
      console.error(`Unable to start screening test: ${error.message}`);
      process.exitCode = 1;
    });
  }
}

async function run() {
  const platform = await selectPlatform();
  const environment = await selectEnvironment();
  console.log(`Starting ${scenario} on ${platform} using ${environmentLabel(environment)}.`);

  const runnerPath = resolve('node_modules', '@wdio', 'cli', 'bin', 'wdio.js');
  await new Promise(resolveRun => {
    const runner = spawn(process.execPath, [runnerPath, 'run', './wdio.conf.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, LT_SCENARIO: scenario, PLATFORM: platform, VG_ENVIRONMENT: environment },
      stdio: 'inherit'
    });

    runner.once('error', error => {
      console.error(`Unable to launch WebdriverIO: ${error.message}`);
      process.exitCode = 1;
      resolveRun();
    });
    runner.once('close', (code, signal) => {
      process.exitCode = code ?? (signal ? 1 : 0);
      resolveRun();
    });
  });
}

async function selectPlatform() {
  if (!stdin.isTTY) {
    const configuredPlatform = process.env.PLATFORM;
    if (!configuredPlatform) {
      throw new Error('No interactive terminal detected. Set PLATFORM=Android or PLATFORM=iOS before running this command.');
    }
    const parsedPlatform = normalizePlatform(configuredPlatform);
    if (!parsedPlatform) {
      throw new Error('PLATFORM must be Android or iOS when running without an interactive terminal.');
    }
    return parsedPlatform;
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    stdout.write('\nScreening test setup: choose a platform before provisioning or device startup.\n');
    while (true) {
      stdout.write('\nChoose the device platform:\n  1) Android\n  2) iOS\n');
      const choice = await prompt.question('Enter 1 or 2: ');
      const platform = normalizePlatform(choice);
      if (platform) {
        return platform;
      }
      stdout.write('Please enter 1 (Android) or 2 (iOS).\n');
    }
  } finally {
    prompt.close();
  }
}

async function selectEnvironment() {
  if (!stdin.isTTY) {
    const configuredEnvironment = process.env.VG_ENVIRONMENT ?? 'mdev';
    const environment = normalizeEnvironment(configuredEnvironment);
    if (!environment) {
      throw new Error('VG_ENVIRONMENT must be mdev, ca-test (CATEST), or ca-dev when running without an interactive terminal.');
    }
    return environment;
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    stdout.write('\nChoose the user-creation environment:\n  1) MDEV\n  2) CA TEST (CATEST)\n  3) CA DEV\n');
    while (true) {
      const choice = await prompt.question('Enter 1, 2, or 3: ');
      const environment = normalizeEnvironment(choice);
      if (environment) {
        return environment;
      }
      stdout.write('Please choose 1 (MDEV), 2 (CA TEST), or 3 (CA DEV).\n');
    }
  } finally {
    prompt.close();
  }
}

function normalizePlatform(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'android') {
    return 'Android';
  }
  if (normalized === '2' || normalized === 'ios') {
    return 'iOS';
  }
  return undefined;
}

export function normalizeEnvironment(value) {
  const normalized = value.trim().toLowerCase().replaceAll('_', '-');
  if (normalized === '1' || normalized === 'mdev') {
    return 'mdev';
  }
  if (normalized === '2' || normalized === 'ca-test' || normalized === 'catest') {
    return 'ca-test';
  }
  if (normalized === '3' || normalized === 'ca-dev' || normalized === 'cadev') {
    return 'ca-dev';
  }
  return undefined;
}

function environmentLabel(environment) {
  return environment === 'ca-test' ? 'CA TEST (CATEST)' : environment.toUpperCase();
}
