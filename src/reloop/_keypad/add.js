import initActions from './util/init-actions';

export default function (actions) {
  initActions(this, actions);

  return this;
}
