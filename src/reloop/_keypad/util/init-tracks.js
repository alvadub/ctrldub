import stateObserver from './state-observer';

export default RL => {
  for (let i = 0, c = RL.TRACKS; i < c; i += 1) {
    RL.CC_TRACKS[i] = RL.host.trackBank.getTrack(i);
    RL.CC_TRACKS[i].addIsSelectedObserver(stateObserver(RL, 'activeTrack', i, 'scalar'));
    RL.CC_TRACKS[i].addNameObserver(20, '', stateObserver(RL, 'currentTracks', i, 'list'));
  }
};
