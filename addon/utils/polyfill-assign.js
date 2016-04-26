import Ember from 'ember';

const { merge, assign } = Ember;

let polyfilledAssign = assign || merge;

export default polyfilledAssign;
