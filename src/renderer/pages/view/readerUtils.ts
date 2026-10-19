export interface WheelGesture {
  lastTime: number;
  delta: number;
  turned: boolean;
  scrolled: boolean;
}

export function turnPageForWheel(
  gesture: WheelGesture,
  event: { deltaY: number; deltaMode: number; timeStamp: number },
  canScroll: boolean,
  viewportHeight: number,
): number {
  if (event.timeStamp - gesture.lastTime > 180) {
    gesture.delta = 0;
    gesture.turned = false;
    gesture.scrolled = false;
  }
  gesture.lastTime = event.timeStamp;
  if (gesture.turned) return 0;
  if (canScroll) {
    gesture.scrolled = true;
    return 0;
  }
  // Finishing a scroll through a tall image must not also turn the page.
  if (gesture.scrolled) return 0;
  let unit = 1;
  if (event.deltaMode === 1) unit = 16;
  else if (event.deltaMode === 2) unit = viewportHeight;
  const delta = event.deltaY * unit;
  if (Math.sign(delta) !== Math.sign(gesture.delta)) gesture.delta = 0;
  gesture.delta += delta;
  if (Math.abs(gesture.delta) < 60) return 0;
  gesture.turned = true;
  return Math.sign(gesture.delta);
}

export function imageSize(
  dimensions: { width: number; height: number } | undefined,
  viewport: { width: number; height: number },
  fit: 'page' | 'width',
  zoom: number,
) {
  const { width, height } = dimensions ?? { width: 160, height: 228 };
  const scale = (fit === 'width' ? viewport.width / width : Math.min(viewport.width / width, viewport.height / height)) * zoom;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
