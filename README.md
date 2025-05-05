<h1>
  <span>
    Parrot
    <img width="4%" src="docs/icon.svg" alt="Parrot Logo" />
  </span>
</h1>

[![npm version](https://img.shields.io/npm/v/@qytera/parrot?style=flat-square)](https://www.npmjs.com/package/@qytera/parrot)
[![npm downloads](https://img.shields.io/npm/dm/@qytera/parrot?style=flat-square)](https://www.npmjs.com/package/@qytera/parrot)
[![open GitHub issues](https://img.shields.io/github/issues-raw/qytera-gmbh/parrot?style=flat-square)](https://github.com/Qytera-Gmbh/parrot/issues?q=is%3Aissue+is%3Aopen)
[![unaddressed GitHub issues](https://img.shields.io/github/issues-search/qytera-gmbh/parrot?label=unaddressed%20issues&query=no%3Aassignee%20is%3Aopen&style=flat-square)](https://github.com/Qytera-Gmbh/parrot/issues?q=is%3Aissue+is%3Aopen+no%3Aassignee)

A flexible and extensible tool for aggregating test results and forwarding them to various destinations, such as HTML reports, Microsoft Teams or Slack. Designed to bridge the gap between testers and management.

<img width="100%" src="docs/flow.svg" alt="Parrot Flow">

Planned features:

- Xray test results aggregation
- Microsoft Teams integration
- Slack integration
- HTML output
- Email integration

> [!WARNING]
> The tool is at a very early stage of development and may frequently introduce breaking changes.

# Installation

```bash
npm install @qytera/parrot
```

# Terminology

Using Parrot means interacting with two main components:

- **Sources**: Sources represent tools, services or files from which test results can be read.

  - Examples: Xray, TestRail

  - **Inlets**: Inlets are the actual entities which store test result data. Sources can be reused to access multiple inlets.

    - Examples: Xray test plans, Xray test sets

- **Drains**: Drains represent tools, services or files into which test results obtained from one or more sources can be written in a human-readable way.

  - Examples: Microsoft Teams, Email

  - **Outlets**: Outlets are the entities which test result data can be written to. Drains can be reused to access multiple outlets.

    - Examples: Microsoft Teams channel, Slack channel

<img width="100%" src="docs/terminology.png" alt="Parrot Terminology">

# Usage

Parrot comes with an easy to use CLI to configure the sources and drains.
