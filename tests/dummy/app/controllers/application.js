import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Controller {
  @tracked changeCount = 0;

  @action
  onChange() {
    this.changeCount = this.changeCount + 1;
  }
}
