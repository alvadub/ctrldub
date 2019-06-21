import { run } from './lib';

/* global loadAPI */
/* eslint-disable no-new-func */

loadAPI(1);

// hack for exposing public symbols
run.call(new Function('return this')());
