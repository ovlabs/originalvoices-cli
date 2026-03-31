import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import * as client from "../client.js";
import { clearConfig, getApiKey, getBaseUrl, saveApiKey, saveBaseUrl } from "../config.js";
import { isJsonMode, printError, printJson, printSuccess } from "../output.js";

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command("auth")
    .description("Manage API key authentication");

  auth
    .command("login")
    .description("Configure your API key")
    .option("--key <apiKey>", "API key (or enter interactively)")
    .option("--base-url <url>", "API base URL")
    .action(async (opts) => {
      let apiKey = opts.key;

      if (!apiKey) {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        apiKey = await rl.question("Enter your API key: ");
        rl.close();
      }

      if (!apiKey?.trim()) {
        printError("API key cannot be empty.");
        process.exit(1);
      }

      if (opts.baseUrl) {
        saveBaseUrl(opts.baseUrl);
      }

      saveApiKey(apiKey.trim());

      // Validate by hitting healthcheck
      const healthy = await client.healthcheck();
      if (healthy) {
        printSuccess("API key saved. Connection to OriginalVoices API verified.");
      } else {
        printSuccess("API key saved.");
        printError(
          `Warning: Could not reach ${getBaseUrl()}. Check your base URL or network.`
        );
      }
    });

  auth
    .command("logout")
    .description("Remove stored API key")
    .action(() => {
      clearConfig();
      printSuccess("API key removed.");
    });

  auth
    .command("status")
    .description("Check current auth status")
    .action(() => {
      const key = getApiKey();
      const baseUrl = getBaseUrl();

      if (isJsonMode()) {
        printJson({
          authenticated: !!key,
          baseUrl,
          keySource: process.env.OV_API_KEY ? "env" : key ? "config" : "none",
        });
        return;
      }

      if (key) {
        const masked = key.slice(0, 8) + "..." + key.slice(-4);
        printSuccess(`Authenticated: ${masked}`);
        console.log(`Base URL: ${baseUrl}`);
        console.log(
          `Source: ${process.env.OV_API_KEY ? "OV_API_KEY env var" : "~/.ov/config.json"}`
        );
      } else {
        printError("Not authenticated. Run `ov auth login` to configure.");
      }
    });
}
