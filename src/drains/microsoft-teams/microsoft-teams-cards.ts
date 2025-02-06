import * as Adaptive from "adaptivecards";
import type { TestResults } from "../../models/test-results-model.js";
import { createPieChart } from "./card-chart.js";

export interface AdaptiveCardMessage {
  attachments: { content: Adaptive.PropertyBag; contentType: string; contentUrl: null | string }[];
  type: "message";
}

/**
 * Returns a test results card that can be sent to a Microsoft Teams channel.
 *
 * @param testResults the test results to convert to a message
 * @param details additional details to include in the message
 * @returns the payload that can be sent to an incoming webhook
 *
 * @see https://dev.teams.microsoft.com/cards/new
 * @see https://adaptivecards.io/explorer/Column.html
 */
export function getTestResultsCard(
  testResults: TestResults,
  details?: Record<string, string>
): AdaptiveCardMessage {
  const card = new Adaptive.AdaptiveCard();
  card.version = new Adaptive.Version(1, 5);
  card.addItem(
    getHeading({
      button: { title: "Open Test Results", url: testResults.url },
      title: "Test Results",
    })
  );
  const summary = getQuickSummary({
    facts: Object.entries(details ?? {}).map(([key, value]) => new Adaptive.Fact(key, value)),
    stats: {
      failed: testResults.results.filter((test) => test.result.status === "fail").length,
      passed: testResults.results.filter((test) => test.result.status === "pass").length,
      pending: testResults.results.filter((test) => test.result.status === "pending").length,
      skipped: testResults.results.filter((test) => test.result.status === "skipped").length,
    },
  });
  summary.separator = true;
  card.addItem(summary);
  card.addItem(getTestList(testResults.results));
  const json = card.toJSON();
  if (!json) {
    throw new Error("failed to create adaptive card");
  }
  return {
    attachments: [
      {
        content: json,
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
      },
    ],
    type: "message",
  };
}

function getHeading(config: {
  button?: { title: string; url: string };
  title: string;
}): Adaptive.CardElement {
  const heading = new Adaptive.ColumnSet();
  const titleColumn = new Adaptive.Column("stretch");
  const title = new Adaptive.TextBlock(config.title);
  title.color = Adaptive.TextColor.Accent;
  title.isSubtle = false;
  title.size = Adaptive.TextSize.Large;
  title.style = "heading";
  title.weight = Adaptive.TextWeight.Default;
  title.wrap = true;
  titleColumn.addItem(title);
  heading.addColumn(titleColumn);
  if (config.button) {
    const buttonColumn = new Adaptive.Column("auto");
    const button = new Adaptive.ActionSet();
    const openUrlAction = new Adaptive.OpenUrlAction();
    openUrlAction.style = Adaptive.ActionStyle.Positive;
    openUrlAction.title = config.button.title;
    openUrlAction.url = config.button.url;
    button.addAction(openUrlAction);
    buttonColumn.addItem(button);
    heading.addColumn(buttonColumn);
  }
  return heading;
}

function getQuickSummary(config: {
  facts?: Adaptive.Fact[];
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
  };
}): Adaptive.CardElement {
  const summary = new Adaptive.ColumnSet();

  // Chart.
  const chartColumn = new Adaptive.Column("auto");
  chartColumn.horizontalAlignment = Adaptive.HorizontalAlignment.Center;
  chartColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Center;
  const pieChart = new Adaptive.Image();
  pieChart.url = createPieChart({
    failed: config.stats.failed,
    passed: config.stats.passed,
    pending: config.stats.pending,
    skipped: config.stats.skipped,
  });
  chartColumn.addItem(pieChart);
  summary.addColumn(chartColumn);

  // Tests summary.
  const testsColumn = new Adaptive.Column("auto");
  testsColumn.horizontalAlignment = Adaptive.HorizontalAlignment.Center;
  testsColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Top;
  const testFacts = new Adaptive.FactSet();
  testFacts.facts = [
    new Adaptive.Fact(
      "Test Cases",
      (
        config.stats.failed +
        config.stats.passed +
        config.stats.pending +
        config.stats.skipped
      ).toString()
    ),
    new Adaptive.Fact("Passed", config.stats.passed.toString()),
    new Adaptive.Fact("Failed", config.stats.failed.toString()),
    new Adaptive.Fact("Skipped", config.stats.skipped.toString()),
    new Adaptive.Fact("Pending", config.stats.pending.toString()),
  ];
  testFacts.horizontalAlignment = Adaptive.HorizontalAlignment.Left;
  testsColumn.addItem(testFacts);
  summary.addColumn(testsColumn);

  // Additional facts.
  if (config.facts && config.facts.length > 0) {
    const additionalFactsColumn = new Adaptive.Column("stretch");
    additionalFactsColumn.horizontalAlignment = Adaptive.HorizontalAlignment.Center;
    additionalFactsColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Top;
    additionalFactsColumn.spacing = Adaptive.Spacing.Large;
    additionalFactsColumn.separator = true;
    const facts = new Adaptive.FactSet();
    facts.horizontalAlignment = Adaptive.HorizontalAlignment.Left;
    facts.facts = config.facts;
    additionalFactsColumn.addItem(facts);
    summary.addColumn(additionalFactsColumn);
  }

  return summary;
}

function getTestList(results: TestResults["results"]): Adaptive.CardElement {
  const container = new Adaptive.Container();
  if (results.length === 0) {
    return container;
  }
  const showTestsId = "show-tests-button";
  const hideTestsId = "hide-tests-button";
  const testsListId = "tests-list";

  // Buttons for toggling test results list.
  const showTestsButton = new Adaptive.ActionSet();
  showTestsButton.id = showTestsId;
  const showTestsAction = new Adaptive.ToggleVisibilityAction();
  showTestsAction.title = "Show Tests";
  showTestsAction.iconUrl = "icon:TaskListLtr";
  showTestsAction.addTargetElement(showTestsId, false);
  showTestsAction.addTargetElement(hideTestsId, true);
  showTestsAction.addTargetElement(testsListId, true);
  showTestsButton.addAction(showTestsAction);
  container.addItem(showTestsButton);
  const hideTestsButton = new Adaptive.ActionSet();
  hideTestsButton.id = hideTestsId;
  hideTestsButton.isVisible = false;
  const hideTestsAction = new Adaptive.ToggleVisibilityAction();
  hideTestsAction.title = "Hide Tests";
  hideTestsAction.iconUrl = "icon:TaskListLtr";
  hideTestsAction.addTargetElement(showTestsId, true);
  hideTestsAction.addTargetElement(hideTestsId, false);
  hideTestsAction.addTargetElement(testsListId, false);
  hideTestsButton.addAction(hideTestsAction);
  container.addItem(hideTestsButton);

  // Container containing test results list.
  const testResultsContainer = new Adaptive.Container();
  testResultsContainer.id = testsListId;
  testResultsContainer.isVisible = false;
  container.addItem(testResultsContainer);

  for (const testResult of results) {
    const testResultColumns = new Adaptive.ColumnSet();
    const openTestButtonColumn = new Adaptive.Column("auto");
    openTestButtonColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Center;
    testResultColumns.addColumn(openTestButtonColumn);
    const testStatusColumn = new Adaptive.Column("auto");
    testStatusColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Center;
    testResultColumns.addColumn(testStatusColumn);
    const testNameColumn = new Adaptive.Column("stretch");
    testNameColumn.verticalContentAlignment = Adaptive.VerticalAlignment.Center;
    testResultColumns.addColumn(testNameColumn);
    testResultsContainer.addItem(testResultColumns);

    // Test button column content.
    const openTestButton = new Adaptive.ActionSet();
    const openTestAction = new Adaptive.OpenUrlAction();
    openTestAction.iconUrl = "icon:CursorClick";
    openTestAction.style = Adaptive.ActionStyle.Positive;
    openTestAction.url = testResult.result.url;
    openTestButton.addAction(openTestAction);
    openTestButtonColumn.addItem(openTestButton);

    // Test status column content.
    const icon = new Adaptive.TextBlock("\u2589");
    icon.size = Adaptive.TextSize.ExtraLarge;
    switch (testResult.result.status) {
      case "fail":
        icon.color = Adaptive.TextColor.Attention;
        break;
      case "pass":
        icon.color = Adaptive.TextColor.Good;
        break;
      case "pending":
        icon.color = Adaptive.TextColor.Default;
        break;
      case "skipped":
        icon.color = Adaptive.TextColor.Warning;
        break;
    }
    testStatusColumn.addItem(icon);

    // Test name column content.
    const testNameBlock = new Adaptive.TextBlock(testResult.test.name);
    testNameBlock.size = Adaptive.TextSize.Medium;
    testNameBlock.weight = Adaptive.TextWeight.Bolder;
    testNameColumn.addItem(testNameBlock);
  }
  return container;
}
