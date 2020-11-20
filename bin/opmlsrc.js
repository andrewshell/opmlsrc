#! /usr/bin/env node

const path = require ('path');
const opmlsrc = require ('../opmlsrc');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;
const filename = path.resolve(process.cwd(), argv._[0]);
const watch = !!argv.watch;

opmlsrc.run (filename, watch);
