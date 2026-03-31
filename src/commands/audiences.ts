import { Command } from "commander";
import * as client from "../client.js";
import {
  isJsonMode,
  printError,
  printJson,
  printSuccess,
  printTable,
} from "../output.js";

export function registerAudiencesCommand(program: Command): void {
  const audiences = program
    .command("audiences")
    .description("Manage saved audiences");

  audiences
    .command("list")
    .description("List all saved audiences")
    .action(async () => {
      try {
        const res = await client.listAudiences();
        if (isJsonMode()) return printJson(res);

        if (res.data.audiences.length === 0) {
          console.log("No saved audiences. Create one with `ov audiences create`.");
          return;
        }

        printTable(
          ["ID", "Title", "Prompt"],
          res.data.audiences.map((a) => [a.id, a.title, a.prompt])
        );
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) return printJson({ error: err.code, message: err.message });
          printError(`${err.message} (${err.code})`);
          process.exit(1);
        }
        throw err;
      }
    });

  audiences
    .command("create")
    .description("Create a new saved audience")
    .requiredOption("--title <title>", "Audience title")
    .requiredOption("--prompt <prompt>", "Audience description/prompt")
    .option("--project-id <id>", "Associate with a project")
    .action(async (opts) => {
      try {
        const res = await client.createAudience({
          title: opts.title,
          prompt: opts.prompt,
          projectId: opts.projectId,
        });
        if (isJsonMode()) return printJson(res);
        printSuccess(`Audience created: ${res.data.id} (${res.data.title})`);
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) return printJson({ error: err.code, message: err.message });
          printError(`${err.message} (${err.code})`);
          process.exit(1);
        }
        throw err;
      }
    });

  audiences
    .command("update <id>")
    .description("Update an audience title")
    .requiredOption("--title <title>", "New title")
    .action(async (id: string, opts) => {
      try {
        const res = await client.updateAudienceTitle(id, opts.title);
        if (isJsonMode()) return printJson(res);
        printSuccess(`Audience updated: ${res.data.id} (${res.data.title})`);
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) return printJson({ error: err.code, message: err.message });
          printError(`${err.message} (${err.code})`);
          process.exit(1);
        }
        throw err;
      }
    });

  audiences
    .command("delete <id>")
    .description("Delete a saved audience")
    .action(async (id: string) => {
      try {
        const res = await client.deleteAudience(id);
        if (isJsonMode()) return printJson(res);
        printSuccess("Audience deleted.");
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) return printJson({ error: err.code, message: err.message });
          printError(`${err.message} (${err.code})`);
          process.exit(1);
        }
        throw err;
      }
    });
}
