import { keys } from '../helpers';

export default (RL, map) => {
  keys(map, key => {
    RL.CC_USER_ACTIONS[key] = map[key];
  });
};
