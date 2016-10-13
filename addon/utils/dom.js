export function getDOM(context) {
  let { renderer } = context;
  if (renderer._dom) { // pre glimmer2
    return renderer._dom;
  } else if (renderer._env && renderer._env.getDOM) { // glimmer 2
    return renderer._env.getDOM();
  } else {
    throw new Error('Unable to get DOM helper');
  }
}
