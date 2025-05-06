import assert from "node:assert";
import path from "node:path";
import { describe, it } from "node:test";
import { StdOutDrain } from "./stdout-drain.js";

describe(path.relative(process.cwd(), import.meta.filename), () => {
  it("outputs summaries", () => {
    const url = "https://example.org";
    const drain = new StdOutDrain({});
    const text = drain.writeTestResults(
      [
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-151",
          name: "test 150",
          status: "pass",
          url: `${url}/browse/PAPA-151`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-150",
          name: "test 149",
          status: "pass",
          url: `${url}/browse/PAPA-150`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-68",
          name: "test 67",
          status: "fail",
          url: `${url}/browse/PAPA-68`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-67",
          name: "test 66",
          status: "fail",
          url: `${url}/browse/PAPA-67`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-66",
          name: "test 65",
          status: "pending",
          url: `${url}/browse/PAPA-66`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-9",
          name: "test 8",
          status: "pending",
          url: `${url}/browse/PAPA-9`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-8",
          name: "test 7",
          status: "skipped",
          url: `${url}/browse/PAPA-8`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-7",
          name: "test 6",
          status: "skipped",
          url: `${url}/browse/PAPA-7`,
        },
      ],
      {
        supportsColor: false,
        useUnicode: false,
      }
    );
    assert.strictEqual(
      text,
      [
        "",
        "",
        "A total of 8 tests were run with a passing percentage of 25.00 %",
        "",
        "Passing tests (2):",
        `  - test 150 (${url}/browse/PAPA-152)`,
        `  - test 149 (${url}/browse/PAPA-152)`,
        "",
        "Pending tests (2):",
        `  - test 65 (${url}/browse/PAPA-152)`,
        `  - test 8 (${url}/browse/PAPA-152)`,
        "",
        "Skipped tests (2):",
        `  - test 7 (${url}/browse/PAPA-152)`,
        `  - test 6 (${url}/browse/PAPA-152)`,
        "",
        "Failed tests (2):",
        `  - test 67 (${url}/browse/PAPA-152)`,
        `  - test 66 (${url}/browse/PAPA-152)`,
      ].join("\n")
    );
  });

  it("outputs colored summaries", () => {
    const url = "https://example.org";
    const drain = new StdOutDrain({});
    const text = drain.writeTestResults(
      [
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-151",
          name: "test 150",
          status: "pass",
          url: `${url}/browse/PAPA-151`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-150",
          name: "test 149",
          status: "pass",
          url: `${url}/browse/PAPA-150`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-68",
          name: "test 67",
          status: "fail",
          url: `${url}/browse/PAPA-68`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-67",
          name: "test 66",
          status: "fail",
          url: `${url}/browse/PAPA-67`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-66",
          name: "test 65",
          status: "pending",
          url: `${url}/browse/PAPA-66`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-9",
          name: "test 8",
          status: "pending",
          url: `${url}/browse/PAPA-9`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-8",
          name: "test 7",
          status: "skipped",
          url: `${url}/browse/PAPA-8`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-7",
          name: "test 6",
          status: "skipped",
          url: `${url}/browse/PAPA-7`,
        },
      ],
      {
        supportsColor: true,
        useUnicode: false,
      }
    );
    assert.strictEqual(
      text,
      [
        "",
        "",
        "\x1B[1m\x1B[37mA total of \x1B[36m8\x1B[39m\x1B[37m tests were run with a passing percentage of \x1B[36m25.00\x1B[39m\x1B[37m %\x1B[39m\x1B[22m",
        "",
        "\x1B[1m\x1B[37mPassing tests (2):\x1B[39m\x1B[22m",
        `\x1B[32m  - test 150 (${url}/browse/PAPA-152)\x1B[39m`,
        `\x1B[32m  - test 149 (${url}/browse/PAPA-152)\x1B[39m`,
        "",
        "\x1B[1m\x1B[37mPending tests (2):\x1B[39m\x1B[22m",
        `\x1B[90m  - test 65 (${url}/browse/PAPA-152)\x1B[39m`,
        `\x1B[90m  - test 8 (${url}/browse/PAPA-152)\x1B[39m`,
        "",
        "\x1B[1m\x1B[37mSkipped tests (2):\x1B[39m\x1B[22m",
        `\x1B[33m  - test 7 (${url}/browse/PAPA-152)\x1B[39m`,
        `\x1B[33m  - test 6 (${url}/browse/PAPA-152)\x1B[39m`,
        "",
        "\x1B[1m\x1B[37mFailed tests (2):\x1B[39m\x1B[22m",
        `\x1B[31m  - test 67 (${url}/browse/PAPA-152)\x1B[39m`,
        `\x1B[31m  - test 66 (${url}/browse/PAPA-152)\x1B[39m`,
      ].join("\n")
    );
  });

  it("outputs emojis", () => {
    const url = "https://example.org";
    const drain = new StdOutDrain({});
    const text = drain.writeTestResults(
      [
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-151",
          name: "test 150",
          status: "pass",
          url: `${url}/browse/PAPA-151`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-150",
          name: "test 149",
          status: "pass",
          url: `${url}/browse/PAPA-150`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-68",
          name: "test 67",
          status: "fail",
          url: `${url}/browse/PAPA-68`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-67",
          name: "test 66",
          status: "fail",
          url: `${url}/browse/PAPA-67`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-66",
          name: "test 65",
          status: "pending",
          url: `${url}/browse/PAPA-66`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-9",
          name: "test 8",
          status: "pending",
          url: `${url}/browse/PAPA-9`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-8",
          name: "test 7",
          status: "skipped",
          url: `${url}/browse/PAPA-8`,
        },
        {
          executionMetadata: { url: `${url}/browse/PAPA-152` },
          id: "PAPA-7",
          name: "test 6",
          status: "skipped",
          url: `${url}/browse/PAPA-7`,
        },
      ],
      {
        supportsColor: false,
        useUnicode: true,
      }
    );
    assert.strictEqual(
      text,
      [
        "",
        "",
        "A total of 8 tests were run with a passing percentage of 25.00 %",
        "",
        "Passing tests (2):",
        `  ✔ test 150 (${url}/browse/PAPA-152)`,
        `  ✔ test 149 (${url}/browse/PAPA-152)`,
        "",
        "Pending tests (2):",
        `  ▸ test 65 (${url}/browse/PAPA-152)`,
        `  ▸ test 8 (${url}/browse/PAPA-152)`,
        "",
        "Skipped tests (2):",
        `  / test 7 (${url}/browse/PAPA-152)`,
        `  / test 6 (${url}/browse/PAPA-152)`,
        "",
        "Failed tests (2):",
        `  ✖ test 67 (${url}/browse/PAPA-152)`,
        `  ✖ test 66 (${url}/browse/PAPA-152)`,
      ].join("\n")
    );
  });
});
