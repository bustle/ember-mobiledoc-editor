import { camelize, capitalize } from '@ember/string';

export default function(string) {
  return capitalize(camelize(string));
}
