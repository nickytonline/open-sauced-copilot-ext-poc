export function getTopPercent(oscr: number) {
  switch (true) {
    case oscr >= 250:
      return 1;
    case oscr >= 235:
      return 2;
    case oscr >= 225:
      return 3;
    case oscr >= 215:
      return 4;
    case oscr >= 200:
      return 5;
    default:
      return "";
  }
}
