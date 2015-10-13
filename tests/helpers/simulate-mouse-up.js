export default function simulateMouseup() {
  let event = document.createEvent('MouseEvents');
  event.initMouseEvent('mouseup');
  document.dispatchEvent(event);
}
