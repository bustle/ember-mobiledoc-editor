import { assign, merge } from '@ember/polyfills';

let polyfilledAssign = assign || merge;

export default polyfilledAssign;
