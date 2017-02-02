export default (RL, map) => {
  Object.keys(map).forEach(key => {
    RL.CC_USER_ACTIONS[key] = map[key];
  });
};
