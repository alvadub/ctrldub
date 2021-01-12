loadAPI(1);

host.defineController('CTRLDUB', 'Steinberg CI2+', '1.0', 'BD3405A8-9C77-449F-BA6D-2E91D9873878');
host.defineMidiPorts(1, 1);

let transport;
let isPlaying = null;
let isRecording = null;

function init() {
  println('CTRLDUB. Steinberg CI2+ -- ON');

  host.getMidiInPort(0).setMidiCallback(onMidi);
  transport = host.createTransport();
  transport.addIsPlayingObserver(x => { isPlaying = x; });
  transport.addIsRecordingObserver(x => { isRecording = x; });
}

function exit() {
  println('CTRLDUB. Steinberg CI2+ -- OFF');
}

function onMidi(status, data1, data2) {
  // 176 60 1/65 - up/down knob
  // 144 58 127/0 - click on knob
  // 144 119 127/0 - lock button

  // 144 88 127/0 - prev button
  // 144 90 127/0 - next button
  // 144 122 127/0 - action button

  if (status === 144) {
    if (data1 === 94 && data2 === 127) {
      if (isPlaying && isRecording) transport.record();
      else if (isPlaying) transport.stop();
      else transport.play();
      return;
    }
    if (data1 === 95 && data2 === 127) {
      transport.record();
      return;
    }
    if (data1 === 122 && data2 === 127) {
      transport.stop();
      return;
    }
  }


  println(status + ', ' + data1 + ', ' + data2);
}
