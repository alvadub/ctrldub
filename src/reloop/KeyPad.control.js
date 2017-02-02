/* global loadAPI */
/* eslint-disable no-new-func */

import run from './_run';

loadAPI(1);

// hack for exposing public symbols
run(new Function('return this')());
