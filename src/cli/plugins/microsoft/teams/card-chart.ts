import { createCanvas } from "canvas";

/**
 * Creates a pie chart PNG for a specified number of test with status fail/pass/skips/todo.
 *
 * @param stats the test stats
 * @param config additional pie chart configuration
 * @returns a base64 PNG data URL
 */
export function createPieChart(
  stats: {
    /**
     * The number of failing tests.
     */
    failed: number;
    /**
     * The number of passing tests.
     */
    passed: number;
    /**
     * The number of pending tests.
     */
    pending: number;
    /**
     * The number of skipped tests.
     */
    skipped: number;
  },
  config?: {
    /**
     * The pie chart coloring options.
     */
    colors?: {
      /**
       * A hex color for failing tests.
       *
       * @default "#F44336"
       */
      fail?: string;
      /**
       * A hex color for passing tests.
       *
       * @default "#4CAF50"
       */
      pass?: string;
      /**
       * A hex color for pending tests.
       *
       * @default "#999900"
       */
      pending?: string;
      /**
       * A hex color for skipped tests.
       *
       * @default "#FFC107"
       */
      skip?: string;
    };
    /**
     * The base size of the pie chart (in pixels). The chart is always a square image.
     *
     * @default 100
     */
    size?: number;
  }
): string {
  const size = config?.size ?? 100;
  const canvas = createCanvas(size, size);
  const colors = {
    fail: config?.colors?.fail ?? "#F44336",
    pass: config?.colors?.pass ?? "#4CAF50",
    pending: config?.colors?.pending ?? "#999999",
    skip: config?.colors?.skip ?? "#FFC107",
  };
  const total = stats.passed + stats.failed + stats.skipped + stats.pending;
  const ctx = canvas.getContext("2d");
  let startAngle = 0;
  // 1st line: bottom right slice
  // 2nd line: bottom left slice
  // 3rd line: top left slice
  // 4th line: top right slice
  for (const { color, value } of [
    { color: colors.skip, value: stats.skipped },
    { color: colors.pending, value: stats.pending },
    { color: colors.fail, value: stats.failed },
    { color: colors.pass, value: stats.passed },
  ]) {
    if (value > 0) {
      const sliceAngle = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(size / 2, size / 2, size / 2, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += sliceAngle;
    }
  }
  return canvas.toDataURL("image/png");
}
