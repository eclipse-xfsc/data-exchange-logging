export function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function convertPixelsToRem(pixels: number) {
  return (
    pixels / parseFloat(getComputedStyle(document.documentElement).fontSize)
  );
}
