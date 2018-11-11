/* global loadAPI */
/* eslint-disable no-new-func */

import run from './lib/main';

loadAPI(1);

// hack for exposing public symbols
run(new Function('return this')());
