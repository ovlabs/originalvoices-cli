import { Command } from "commander";
import * as client from "../client.js";
import { isJsonMode, printError, printJson, printTable } from "../output.js";

export function registerProjectsCommand(program: Command): void {
  const projects = program
    .command("projects")
    .description("Manage projects");

  projects
    .command("list")
    .description("List all projects")
    .action(async () => {
      try {
        const res = await client.listProjects();
        if (isJsonMode()) return printJson(res);

        if (res.data.length === 0) {
          console.log("No projects found.");
          return;
        }

        printTable(
          ["ID", "Title", "Description"],
          res.data.map((p) => [p.id, p.title, p.description || "—"])
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
}
