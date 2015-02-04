#!/usr/bin/env node

'use strict';

var ws = require('ws'),
    jazz = require('jazz-midi'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    p: 'port'
  },
  string: ['port'],
  boolean: ['help', 'version']
});

var pkg = require('../package.json');

function writeln() {
  process.stdout.write(Array.prototype.slice.call(arguments).join('') + '\n');
}

function exit(status) {
  if (arguments.length > 1) {
    process.stderr.write(Array.prototype.slice.call(arguments, 1).join('') + '\n');
  }

  process.exit.bind(process)(status);
}

if (argv.version) {
  exit(1, [pkg.description, pkg.version].join(' v'));
}

if (argv.help) {
  var message = [];

  message.push('Usage:');
  message.push('  keypad -p 5000');

  message.push('Options:');
  message.push('  -p, --port       The port used for exposing the server');
  message.push('  -v, --version    Show the current version');
  message.push('  -h, --help       Display this help');

  exit(1, message.join('\n'));
}

var input = jazz.MidiInList();

if (!input.length) {
  writeln('Waiting for input...');

  while (!input.length) {
    input = jazz.MidiInList();
  }

  var test = 'Reloop KeyPad MIDI';

  input = input.filter(function(id) {
    if (test.indexOf(id) !== -1) {
      return true;
    }
  });
}

if (!input.length) {
  exit(1, 'Missing input!');
} else {
  input = input.shift();
}

var express = require('express'),
    serveStatic = require('serve-static');

var app = express();

var port = argv.port && /^\d+$/.test(argv.port) ? +argv.port : 8080;

app.use(serveStatic('www'));
app.listen(port);

writeln('Open http://localhost:', port, '/');

var midi = new jazz.MIDI();

var server = new ws.Server({
  port: port + 1
});

server.on('connection', function(ws) {
  var callback = function(tick, data) {
    ws.send(JSON.stringify({
      tick: tick,
      data: data
    }));
  };

  ws.on('message', function(message) {
    var data = JSON.parse(message);

    if (data.status === 'ping') {
      writeln('CONNECTED');
    } else {
      writeln(message);
    }
  });

  if (midi.MidiInOpen(input, callback) !== input) {
    writeln('ERR');
  } else {
    ws.send(JSON.stringify({
      status: 'pong'
    }));
  }
});
