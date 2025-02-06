import assert from "node:assert";
import path from "node:path";
import { describe, it } from "node:test";
import { JIRA_CLIENT_CLOUD, XRAY_CLIENT_CLOUD } from "../../../test/clients.js";
import { getEnv } from "../../util/env.js";
import { XrayTestPlanSource } from "./xray-test-plan-source.js";

describe(path.relative(process.cwd(), import.meta.filename), () => {
  describe("xray cloud", () => {
    it("returns test plan data", async () => {
      const url = getEnv("jira-url");
      const source = new XrayTestPlanSource({
        jira: { authentication: "basic", client: JIRA_CLIENT_CLOUD, url: url },
        xray: {
          authentication: "client-credentials",
          client: XRAY_CLIENT_CLOUD,
          url: getEnv("xray-url"),
        },
      });
      const testPlan = await source.getTestResults("PAPA-152");
      assert.deepStrictEqual(testPlan, {
        id: "PAPA-152",
        name: "test plan with 150 tests",
        results: [
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-151", name: "test 150", url: `${url}/browse/PAPA-151` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-150", name: "test 149", url: `${url}/browse/PAPA-150` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-149", name: "test 148", url: `${url}/browse/PAPA-149` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-148", name: "test 147", url: `${url}/browse/PAPA-148` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-147", name: "test 146", url: `${url}/browse/PAPA-147` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-146", name: "test 145", url: `${url}/browse/PAPA-146` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-145", name: "test 144", url: `${url}/browse/PAPA-145` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-144", name: "test 143", url: `${url}/browse/PAPA-144` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-143", name: "test 142", url: `${url}/browse/PAPA-143` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-142", name: "test 141", url: `${url}/browse/PAPA-142` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-141", name: "test 140", url: `${url}/browse/PAPA-141` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-140", name: "test 139", url: `${url}/browse/PAPA-140` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-139", name: "test 138", url: `${url}/browse/PAPA-139` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-138", name: "test 137", url: `${url}/browse/PAPA-138` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-137", name: "test 136", url: `${url}/browse/PAPA-137` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-136", name: "test 135", url: `${url}/browse/PAPA-136` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-135", name: "test 134", url: `${url}/browse/PAPA-135` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-134", name: "test 133", url: `${url}/browse/PAPA-134` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-133", name: "test 132", url: `${url}/browse/PAPA-133` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-132", name: "test 131", url: `${url}/browse/PAPA-132` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-131", name: "test 130", url: `${url}/browse/PAPA-131` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-130", name: "test 129", url: `${url}/browse/PAPA-130` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-129", name: "test 128", url: `${url}/browse/PAPA-129` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-128", name: "test 127", url: `${url}/browse/PAPA-128` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-127", name: "test 126", url: `${url}/browse/PAPA-127` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-126", name: "test 125", url: `${url}/browse/PAPA-126` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-125", name: "test 124", url: `${url}/browse/PAPA-125` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-124", name: "test 123", url: `${url}/browse/PAPA-124` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-123", name: "test 122", url: `${url}/browse/PAPA-123` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-122", name: "test 121", url: `${url}/browse/PAPA-122` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-121", name: "test 120", url: `${url}/browse/PAPA-121` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-120", name: "test 119", url: `${url}/browse/PAPA-120` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-119", name: "test 118", url: `${url}/browse/PAPA-119` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-118", name: "test 117", url: `${url}/browse/PAPA-118` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-117", name: "test 116", url: `${url}/browse/PAPA-117` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-116", name: "test 115", url: `${url}/browse/PAPA-116` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-115", name: "test 114", url: `${url}/browse/PAPA-115` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-114", name: "test 113", url: `${url}/browse/PAPA-114` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-113", name: "test 112", url: `${url}/browse/PAPA-113` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-112", name: "test 111", url: `${url}/browse/PAPA-112` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-111", name: "test 110", url: `${url}/browse/PAPA-111` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-110", name: "test 109", url: `${url}/browse/PAPA-110` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-109", name: "test 108", url: `${url}/browse/PAPA-109` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-108", name: "test 107", url: `${url}/browse/PAPA-108` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-107", name: "test 106", url: `${url}/browse/PAPA-107` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-106", name: "test 105", url: `${url}/browse/PAPA-106` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-105", name: "test 104", url: `${url}/browse/PAPA-105` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-104", name: "test 103", url: `${url}/browse/PAPA-104` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-103", name: "test 102", url: `${url}/browse/PAPA-103` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-102", name: "test 101", url: `${url}/browse/PAPA-102` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-101", name: "test 100", url: `${url}/browse/PAPA-101` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-100", name: "test 99", url: `${url}/browse/PAPA-100` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-99", name: "test 98", url: `${url}/browse/PAPA-99` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-98", name: "test 97", url: `${url}/browse/PAPA-98` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-97", name: "test 96", url: `${url}/browse/PAPA-97` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-96", name: "test 95", url: `${url}/browse/PAPA-96` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-95", name: "test 94", url: `${url}/browse/PAPA-95` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-94", name: "test 93", url: `${url}/browse/PAPA-94` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-93", name: "test 92", url: `${url}/browse/PAPA-93` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-92", name: "test 91", url: `${url}/browse/PAPA-92` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-91", name: "test 90", url: `${url}/browse/PAPA-91` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-90", name: "test 89", url: `${url}/browse/PAPA-90` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-89", name: "test 88", url: `${url}/browse/PAPA-89` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-88", name: "test 87", url: `${url}/browse/PAPA-88` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-87", name: "test 86", url: `${url}/browse/PAPA-87` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-86", name: "test 85", url: `${url}/browse/PAPA-86` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-85", name: "test 84", url: `${url}/browse/PAPA-85` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-84", name: "test 83", url: `${url}/browse/PAPA-84` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-83", name: "test 82", url: `${url}/browse/PAPA-83` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-82", name: "test 81", url: `${url}/browse/PAPA-82` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-81", name: "test 80", url: `${url}/browse/PAPA-81` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-80", name: "test 79", url: `${url}/browse/PAPA-80` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-79", name: "test 78", url: `${url}/browse/PAPA-79` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-78", name: "test 77", url: `${url}/browse/PAPA-78` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-77", name: "test 76", url: `${url}/browse/PAPA-77` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-76", name: "test 75", url: `${url}/browse/PAPA-76` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-75", name: "test 74", url: `${url}/browse/PAPA-75` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-74", name: "test 73", url: `${url}/browse/PAPA-74` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-73", name: "test 72", url: `${url}/browse/PAPA-73` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-72", name: "test 71", url: `${url}/browse/PAPA-72` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-71", name: "test 70", url: `${url}/browse/PAPA-71` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-70", name: "test 69", url: `${url}/browse/PAPA-70` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-69", name: "test 68", url: `${url}/browse/PAPA-69` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-68", name: "test 67", url: `${url}/browse/PAPA-68` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-67", name: "test 66", url: `${url}/browse/PAPA-67` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-66", name: "test 65", url: `${url}/browse/PAPA-66` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-65", name: "test 64", url: `${url}/browse/PAPA-65` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-64", name: "test 63", url: `${url}/browse/PAPA-64` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-63", name: "test 62", url: `${url}/browse/PAPA-63` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-62", name: "test 61", url: `${url}/browse/PAPA-62` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-61", name: "test 60", url: `${url}/browse/PAPA-61` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-60", name: "test 59", url: `${url}/browse/PAPA-60` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-59", name: "test 58", url: `${url}/browse/PAPA-59` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-58", name: "test 57", url: `${url}/browse/PAPA-58` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-57", name: "test 56", url: `${url}/browse/PAPA-57` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-56", name: "test 55", url: `${url}/browse/PAPA-56` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-55", name: "test 54", url: `${url}/browse/PAPA-55` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-54", name: "test 53", url: `${url}/browse/PAPA-54` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-53", name: "test 52", url: `${url}/browse/PAPA-53` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-52", name: "test 51", url: `${url}/browse/PAPA-52` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-51", name: "test 50", url: `${url}/browse/PAPA-51` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-50", name: "test 49", url: `${url}/browse/PAPA-50` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-49", name: "test 48", url: `${url}/browse/PAPA-49` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-48", name: "test 47", url: `${url}/browse/PAPA-48` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-47", name: "test 46", url: `${url}/browse/PAPA-47` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-46", name: "test 45", url: `${url}/browse/PAPA-46` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-45", name: "test 44", url: `${url}/browse/PAPA-45` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-44", name: "test 43", url: `${url}/browse/PAPA-44` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-43", name: "test 42", url: `${url}/browse/PAPA-43` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-42", name: "test 41", url: `${url}/browse/PAPA-42` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-41", name: "test 40", url: `${url}/browse/PAPA-41` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-40", name: "test 39", url: `${url}/browse/PAPA-40` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-39", name: "test 38", url: `${url}/browse/PAPA-39` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-38", name: "test 37", url: `${url}/browse/PAPA-38` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-37", name: "test 36", url: `${url}/browse/PAPA-37` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-36", name: "test 35", url: `${url}/browse/PAPA-36` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-35", name: "test 34", url: `${url}/browse/PAPA-35` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-34", name: "test 33", url: `${url}/browse/PAPA-34` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-33", name: "test 32", url: `${url}/browse/PAPA-33` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-32", name: "test 31", url: `${url}/browse/PAPA-32` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-31", name: "test 30", url: `${url}/browse/PAPA-31` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-30", name: "test 29", url: `${url}/browse/PAPA-30` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-29", name: "test 28", url: `${url}/browse/PAPA-29` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-28", name: "test 27", url: `${url}/browse/PAPA-28` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-27", name: "test 26", url: `${url}/browse/PAPA-27` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-26", name: "test 25", url: `${url}/browse/PAPA-26` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-25", name: "test 24", url: `${url}/browse/PAPA-25` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-24", name: "test 23", url: `${url}/browse/PAPA-24` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-23`,
            },
            test: { id: "PAPA-23", name: "test 22", url: `${url}/browse/PAPA-23` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-22", name: "test 21", url: `${url}/browse/PAPA-22` },
          },
          {
            result: {
              status: "skipped",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-21`,
            },
            test: { id: "PAPA-21", name: "test 20", url: `${url}/browse/PAPA-21` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-20", name: "test 19", url: `${url}/browse/PAPA-20` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-19", name: "test 18", url: `${url}/browse/PAPA-19` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-18`,
            },
            test: { id: "PAPA-18", name: "test 17", url: `${url}/browse/PAPA-18` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-17`,
            },
            test: { id: "PAPA-17", name: "test 16", url: `${url}/browse/PAPA-17` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-16", name: "test 15", url: `${url}/browse/PAPA-16` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-15`,
            },
            test: { id: "PAPA-15", name: "test 14", url: `${url}/browse/PAPA-15` },
          },
          {
            result: {
              status: "fail",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-14`,
            },
            test: { id: "PAPA-14", name: "test 13", url: `${url}/browse/PAPA-14` },
          },
          {
            result: {
              status: "skipped",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-13`,
            },
            test: { id: "PAPA-13", name: "test 12", url: `${url}/browse/PAPA-13` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-12`,
            },
            test: { id: "PAPA-12", name: "test 11", url: `${url}/browse/PAPA-12` },
          },
          {
            result: {
              status: "fail",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-11`,
            },
            test: { id: "PAPA-11", name: "test 10", url: `${url}/browse/PAPA-11` },
          },
          {
            result: {
              status: "pass",
              url: `${url}/projects/PAPA?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=PAPA-154&ac.testKey=PAPA-10`,
            },
            test: { id: "PAPA-10", name: "test 9", url: `${url}/browse/PAPA-10` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-9", name: "test 8", url: `${url}/browse/PAPA-9` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-8", name: "test 7", url: `${url}/browse/PAPA-8` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-7", name: "test 6", url: `${url}/browse/PAPA-7` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-6", name: "test 5", url: `${url}/browse/PAPA-6` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-5", name: "test 4", url: `${url}/browse/PAPA-5` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-4", name: "test 3", url: `${url}/browse/PAPA-4` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-3", name: "test 2", url: `${url}/browse/PAPA-3` },
          },
          {
            result: { status: "pending", url: `${url}/browser/PAPA-152` },
            test: { id: "PAPA-2", name: "test 1", url: `${url}/browse/PAPA-2` },
          },
        ],
        url: `${url}/browse/PAPA-152`,
      });
    });
  });
});
