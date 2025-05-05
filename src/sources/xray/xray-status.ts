import type { TestResult } from "../../models/test-model.js";

/**
 * Converts an Xray status to a Parrot status.
 *
 * @param xrayStatus the Xray status
 * @returns the corresponding Parrot status
 */
export function convertStatus(xrayStatus: string): TestResult["status"] {
  if (xrayStatus === "PASSED" || xrayStatus === "PASS") {
    return "pass";
  }
  if (xrayStatus === "FAILED" || xrayStatus === "FAIL") {
    return "fail";
  }
  if (xrayStatus === "TO DO" || xrayStatus === "TODO") {
    return "pending";
  }
  if (xrayStatus === "SKIPPED") {
    return "skipped";
  }
  throw new Error(`Unknown Xray status: ${xrayStatus}`);
}
