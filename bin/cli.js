#!/usr/bin/env node

'use strict';

const ws = require('ws');
const jazz = require('jazz-midi');
const minimist = require('minimist');

const express = require('express');
const serveStatic = require('serve-static');

const pkg = require('../package.json');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    p: 'port',
  },
  string: ['port'],
  boolean: ['help', 'version'],
});


function write() {
  process.stdout.write(Array.prototype.slice.call(arguments).join(''));
}

function exit(status) {
  if (arguments.length > 1) {
    process.stderr.write(`${Array.prototype.slice.call(arguments, 1).join('')}\n`);
  }

  process.exit.bind(process)(status);
}

if (argv.version) {
  exit(1, [pkg.description, pkg.version].join(' v'));
}

if (argv.help) {
  const message = [];

  message.push('Usage:');
  message.push('  keypad -p 5000');

  message.push('Options:');
  message.push('  -p, --port       The port used for exposing the server');
  message.push('  -v, --version    Show the current version');
  message.push('  -h, --help       Display this help');

  exit(1, message.join('\n'));
}

let input = jazz.MidiInList();

if (!input.length) {
  write('Waiting for input ... ');

  while (!input.length) {
    input = jazz.MidiInList();
  }

  const test = 'Reloop KeyPad MIDI';

  input = input.filter(id => {
    if (id.indexOf(test) !== -1) {
      return true;
    }

    return false;
  });

  write('OK\n');
}

if (!input.length) {
  exit(1, 'Missing input!');
} else {
  input = input.shift();
}

const app = express();

const port = argv.port && /^\d+$/.test(argv.port) ? +argv.port : 8080;

write('Listening on http://localhost:', port, '/\n');
write('[press CTRL-C to quit]\n');

app.use(serveStatic('www'));
app.listen(port);

const midi = new jazz.MIDI();

const server = new ws.Server({
  port: port + 1,
});

server.on('connection', _ws => {
  const callback = (tick, data) => {
    _ws.send(JSON.stringify({
      tick,
      data,
    }));
  };

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.status === 'ping') {
      write('Connected\n');

      ws.send(JSON.stringify({
        label: input,
        status: 'pong',
      }));
    } else {
      write(`${message}\n`);
    }
  });

  if (midi.MidiInOpen(input, callback) !== input) {
    write('ERR\n');
  }

  midi.OnDisconnectMidiIn(name => {
    write('Disconnected\n');

    ws.send(JSON.stringify({
      label: name,
      status: 'quit',
    }));

    exit();
  });
});
