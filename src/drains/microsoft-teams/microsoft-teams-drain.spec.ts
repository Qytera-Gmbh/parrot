import assert from "node:assert";
import { platform } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { getEnv } from "../../util/env.js";
import { MicrosoftTeamsDrain } from "./microsoft-teams-drain.js";

describe(path.relative(process.cwd(), import.meta.filename), () => {
  it("pushes test plan data", async () => {
    const url = getEnv("jira-url");
    const drain = new MicrosoftTeamsDrain({
      incomingWebhookUrl: getEnv("microsoft-teams-webhook-url"),
    });
    const card = await drain.writeTestResults({
      id: "PAPA-152",
      name: "Test Plan With Tests",
      results: [
        {
          result: { status: "pass", url: `${url}/browse/PAPA-151` },
          test: { id: "PAPA-151", name: "test 150", url: `${url}/browse/PAPA-151` },
        },
        {
          result: { status: "pass", url: `${url}/browse/PAPA-150` },
          test: { id: "PAPA-150", name: "test 149", url: `${url}/browse/PAPA-150` },
        },
        {
          result: { status: "fail", url: `${url}/browse/PAPA-68` },
          test: { id: "PAPA-68", name: "test 67", url: `${url}/browse/PAPA-68` },
        },
        {
          result: { status: "fail", url: `${url}/browse/PAPA-67` },
          test: { id: "PAPA-67", name: "test 66", url: `${url}/browse/PAPA-67` },
        },
        {
          result: { status: "pending", url: `${url}/browse/PAPA-66` },
          test: { id: "PAPA-66", name: "test 65", url: `${url}/browse/PAPA-66` },
        },
        {
          result: { status: "pending", url: `${url}/browse/PAPA-9` },
          test: { id: "PAPA-9", name: "test 8", url: `${url}/browse/PAPA-9` },
        },
        {
          result: { status: "skipped", url: `${url}/browse/PAPA-8` },
          test: { id: "PAPA-8", name: "test 7", url: `${url}/browse/PAPA-8` },
        },
        {
          result: { status: "skipped", url: `${url}/browse/PAPA-7` },
          test: { id: "PAPA-7", name: "test 6", url: `${url}/browse/PAPA-7` },
        },
      ],
      url: `${url}/browse/PAPA-152`,
    });
    // Canvas generates different PNG strings based on OS.
    const imageString =
      platform() === "linux"
        ? "data:image/png;base64,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"
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAI0ElEQVR4nO2de2xWZx3HP7/nvG+BcZHbBrpsyuYoJG7J1kEZgZbSwgK0XAfiFLJRegE2Ik5FY6YxzGjmjE7REkAFmQ4Zt9IpbmFRJ2FeYtRolDI3NMx1ZBu39qW8ffuen3/0Qlt6eS/nvOeFcz5Jk9Nznuf3fPt++5zL8z7n+QlZzqXiqWNQzbWMmaToRFVygfGCDlVkqAijUIaufOxDABHgvEBERSPYpkHglA2nMPbJHNvUH1p66H1v/6L+Ea8F9KRp1pTxamQmoiWCzAEmJFKv3ZABEWhAOG4rx9Q2L/1y2cH/pqPXabLCkMaSaZPF1tWILgPuSiVGoob0wilR2Y9t9tQ9dOBkqkGcwjNDLs3KGyuWeViQVcD96cZLw5Cu/FHhOROKP19XVveeEwGTJeOGNJfk3R7X0BOga4GbnIrrkCEdRAV2G9GnahfXnnEy8EBkzJDmuVMnxOPyadBKYLDT8R02BACBmMJeY+yvHVl0pN7xBnpv01107j1DI/bgJ1GeAEJuteOGIV1oRfQH8ZyWJ4/OP3rJzYaMm8Ejs6eUReKDT6JsxkUzMkAIlY2h6KCTpYcXrUbd+0d2JXDb6YkfAkVuxO8Nl3tIT16xbVPuxi2z4z0kUpK/KG7zZzJohgcUW8b+24KDS5Y7HdixHqJ5eeHIKGsLyuedjJsoGe4hHSii3xvSkvO5F1a80OJEQEd6SOTBvA9GRlon2q8VWfGwmSEElY1XwrFXF9YuHOdEwLQNaZ47dYK2Wr/FgYe76xWFfNs2r5XuX5bSKENX0jKkqeSBu+NxPU6Kwx03GBOw4r9bWLvw3nSCpGxI45wphWj8OIgnJ+8sZZxtm98sOLxoZqoBUjKkqTj/HrHlMDAi1YZvYEaIyotlB5bel0rlpA25MDvvTtCXgJGpNOgTRqixfzX/4JKJyVZMypDGudNvCYl1FBifbEM+5GYjenT+vuVJfVYJG6LzPjpI4q2/ILiAJ8MdVjh2ePm+5TmJVkjYkMvR0d/Ex7e2qaKQ3xyOfT3R8gkZEimeWqrCY6nL8j2byg4tXpxIwQENaS7Ju11hN/56AncaUfhR2ZGyAecH9GuIgsTV2gWMdkqZjxmlcWv7QIX6NSRSPOVhbuxR20xTUnp40cf7K9CnIe/Pyx8BPO24pIDvlOxb/oG+DvZpyOCoPhUMi7iAyvhBodav9HW4V0Muzsm/S4X17qnyNyL6+LxDi+/s7Vivhli2fgGwXFXlb0KW6ObeDlxjyOW5U24DPuW6JJ8jKo/MP7D0wz33X2OIxtkMJPyoH5AaCmFjxT/Tc383Qxrn3XuzImsyJ8vnqFQsObhkTNdd3XtIS+gTwJBMavI5Q2KwsuuOboa0T3wOyCAi2u0z7zSksWTaZILR3IyjkL+wdmFux++dhoitq72RFKC2+WTH9tVTVtvLMgEeoPBQx7YBuDz7gVsJvgn0ksmldaW3QrshtokXe6sngFh4FnScslSCIXaPUdEi6LyG6GwvxQSAwGwAuTQrb6yxrHe9FpQuHs1+d5RYLDzGIJI7cNGATJBjxScay7ICQ7IEWzTXqGpgSJYgorlGIen5pwHuIJBrCObpZg226DgjyjCvhQS0IbYZbhCGey0koB3R4QYCQ7KI4QaCU1YWMTz00xXlXotwhLrRG72W4AgGaPJaREAnjQZo9FpFQCeBIVlGo1HV4JSVPTQaEXnHaxUBnZw1IpKRpesCEkDkpLFtOzAkW1DqjTEmMCRbMFJvjDGeLx4c0I7V/LpZu3btOSCrltv2KadlOucMgKr+2ms1vkd5Ba5OJQ0M8Rpp6xQGIBwOH/NWje9RJHTVkPLy8reB4G7LO/4lBZcboMvsd1U96J0enyOyv2Oz0xBjzC5PxASA0Z91bnZsVFZWngL+5IkgX6OvyYxo5+Wi2zuGqron84J8jkq3z7z7S58izwPNGRXkby7TmrOv645uhlRVVb0nIjszq8nXbJeSxm5Z465ZyUFEngYcWVg+oF+itJpneu68xpCKioq3gJ9kRJK/+bEUN/+v586+1sv6BtDqrh5fEwPpdXG4Xg2pqqp6A9jqqiR/86wUXjnd24E+V5QLhUJfBq7pUgFp08Cg6Ja+DvZpSHl5eaOIfNYdTT5GdKNMo89Mb/2uSlpZWbkX2sbpAxzhZSlo2d9fgQEXUm5tbX0UyOoMy9cHch5bqgYqNaAhGzZsOCMijwDqhCyfooj9qBRd+c9ABRNa+72ysvJF4Nl0VfkW5RkpaKlNpGjC2RFGjRq1GfhDyqJ8i55gWPRLiZZO2JAVK1a0hMPhMoJvFhNHeINYeKncTyzRKkll2FmzZs278Xh8PtCQtDj/0YDKHCmJnE2mUtI5qNavX/8m8CBwIdm6PuIS2Av6ehrvj5SytFVVVf1dVRcBF1Opf4NzEdsskMLYX1KpnHIew+rq6ldt255BMLzSlXew7VlS1Hw81QBpZfpct27dP4wxM4FT6cS5QXgTm5lSFPtrOkHSzoVbUVFx2hhTgK9vifUEEp4mRdF/pxvJkWzRFRUVZxsaGmYAXwVsJ2JeJyjwXca2FElBkyOLwDme6Gvbtm1lIrKLDOetqpyU8ffULyJaLgUtB5wM6kgP6Up1dXWdZVn3ATfyfOGXwdzttBngciq89t7yfeA2N9uBjPWQt0G+KIVXXJtz4HgP6Up1dXVdNBr9GPBtru/v6GPAt7CjuW6aARlMFllTU/MRY8wmoBIY7HR8l3pIC6I/R2WLFEZfd6OBnmQ8e+eOHTvGqeomVX0cuMmpuA4bEgV2Y5stUtT8lpOBB8KzdKpbt24dEw6HVwKrgPx04zljiP4elT3kRPfKdM45EDBpsiK/7fbt2ycCq1R1GTA5lRhpGPJPRPaj+lymTkv9kRWGdKWmpuYWY0whUNL+c0ci9ZIwpAGR4yjHQI5KYfOZFKW6QtYZ0pOdO3eOVtWJqjqpfY3hibStpDqUtuUJRwLD2gyRJtALKI0ITcBZVOoR6rGlnlBzvczkvHd/zcD8H97Wikp9TSlbAAAAAElFTkSuQmCC";
    assert.deepStrictEqual(card, {
      attachments: [
        {
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            body: [
              {
                columns: [
                  {
                    items: [
                      {
                        color: "Accent",
                        isSubtle: false,
                        size: "Large",
                        style: "heading",
                        text: "Test Results",
                        type: "TextBlock",
                        weight: "Default",
                        wrap: true,
                      },
                    ],
                    type: "Column",
                    width: "stretch",
                  },
                  {
                    items: [
                      {
                        actions: [
                          {
                            style: "positive",
                            title: "Open Test Results",
                            type: "Action.OpenUrl",
                            url: `${url}/browse/PAPA-152`,
                          },
                        ],
                        type: "ActionSet",
                      },
                    ],
                    type: "Column",
                    width: "auto",
                  },
                ],
                type: "ColumnSet",
              },
              {
                columns: [
                  {
                    horizontalAlignment: "Center",
                    items: [
                      {
                        type: "Image",
                        url: imageString,
                      },
                    ],
                    type: "Column",
                    verticalContentAlignment: "Center",
                    width: "auto",
                  },
                  {
                    horizontalAlignment: "Center",
                    items: [
                      {
                        facts: [
                          { title: "Test Cases", value: "8" },
                          { title: "Passed", value: "2" },
                          { title: "Failed", value: "2" },
                          { title: "Skipped", value: "2" },
                          { title: "Pending", value: "2" },
                        ],
                        horizontalAlignment: "Left",
                        type: "FactSet",
                      },
                    ],
                    type: "Column",
                    verticalContentAlignment: "Top",
                    width: "auto",
                  },
                  {
                    horizontalAlignment: "Center",
                    items: [
                      {
                        facts: [
                          { title: "ID", value: "PAPA-152" },
                          { title: "Name", value: "Test Plan With Tests" },
                        ],
                        horizontalAlignment: "Left",
                        type: "FactSet",
                      },
                    ],
                    separator: true,
                    spacing: "Large",
                    type: "Column",
                    verticalContentAlignment: "Top",
                    width: "stretch",
                  },
                ],
                separator: true,
                type: "ColumnSet",
              },
              {
                items: [
                  {
                    actions: [
                      {
                        iconUrl: "icon:TaskListLtr",
                        targetElements: [
                          { elementId: "show-tests-button", isVisible: false },
                          { elementId: "hide-tests-button", isVisible: true },
                          { elementId: "tests-list", isVisible: true },
                        ],
                        title: "Show Tests",
                        type: "Action.ToggleVisibility",
                      },
                    ],
                    id: "show-tests-button",
                    type: "ActionSet",
                  },
                  {
                    actions: [
                      {
                        iconUrl: "icon:TaskListLtr",
                        targetElements: [
                          { elementId: "show-tests-button", isVisible: true },
                          { elementId: "hide-tests-button", isVisible: false },
                          { elementId: "tests-list", isVisible: false },
                        ],
                        title: "Hide Tests",
                        type: "Action.ToggleVisibility",
                      },
                    ],
                    id: "hide-tests-button",
                    isVisible: false,
                    type: "ActionSet",
                  },
                  {
                    id: "tests-list",
                    isVisible: false,
                    items: [
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-151`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Good",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 150",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-150`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Good",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 149",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-68`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Attention",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 67",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-67`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Attention",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 66",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-66`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Default",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 65",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-9`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Default",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 8",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-8`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Warning",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 7",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                      {
                        columns: [
                          {
                            items: [
                              {
                                actions: [
                                  {
                                    iconUrl: "icon:CursorClick",
                                    style: "positive",
                                    type: "Action.OpenUrl",
                                    url: `${url}/browse/PAPA-7`,
                                  },
                                ],
                                type: "ActionSet",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                color: "Warning",
                                size: "ExtraLarge",
                                text: "\u2589",
                                type: "TextBlock",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "auto",
                          },
                          {
                            items: [
                              {
                                size: "Medium",
                                text: "test 6",
                                type: "TextBlock",
                                weight: "Bolder",
                              },
                            ],
                            type: "Column",
                            verticalContentAlignment: "Center",
                            width: "stretch",
                          },
                        ],
                        type: "ColumnSet",
                      },
                    ],
                    type: "Container",
                  },
                ],
                type: "Container",
              },
            ],
            type: "AdaptiveCard",
            version: "1.5",
          },
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
        },
      ],
      type: "message",
    });
  });
});
