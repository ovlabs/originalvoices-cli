import { Command } from "commander";
import * as client from "../client.js";
import {
  isJsonMode,
  printAnswers,
  printChoices,
  printError,
  printJson,
} from "../output.js";

export function registerAskCommand(program: Command): void {
  const ask = program
    .command("ask")
    .description("Ask questions to Digital Twins")
    .argument("<questions...>", "One or more questions to ask")
    .option("--audience <prompt>", "Audience description (e.g. 'women 25-35 in the US')")
    .option("--audience-id <id>", "Saved audience ID")
    .option("--project <id>", "Project ID (requires PROJECTS permission)")
    .option("--filter <filter>", "Filter for project respondents")
    .option("--twin <id>", "Ask a single twin by ID (requires TWIN_ASK permission)")
    .option(
      "--type <type>",
      "Question type: open or choices",
      "open"
    )
    .option("--choices <items>", "Comma-separated choices (for --type choices)")
    .option(
      "--sample-size <size>",
      "Sample size: low, medium, high, very_high",
      "medium"
    )
    .option("--multiple-choice", "Allow multiple selections (for choices type)")
    .action(async (questions: string[], opts) => {
      try {
        // Single twin mode
        if (opts.twin) {
          if (opts.type === "choices") {
            if (!opts.choices) {
              printError("--choices is required when using --type choices");
              process.exit(1);
            }
            const res = await client.askTwinChoices(opts.twin, {
              question: questions[0],
              choices: opts.choices.split(",").map((c: string) => c.trim()),
              isMultipleChoice: opts.multipleChoice || false,
            });
            if (isJsonMode()) return printJson(res);
            console.log(`Selected: ${res.data.selected.join(", ")}`);
            return;
          }

          const res = await client.askTwinOpen(opts.twin, {
            questions: questions.length > 1 ? questions : undefined,
            question: questions.length === 1 ? questions[0] : undefined,
          });
          if (isJsonMode()) return printJson(res);
          // Single twin returns flat array
          for (const a of res.data.answers) {
            console.log(`  ${a.answer}`);
          }
          return;
        }

        // Project mode
        if (opts.project) {
          const res = await client.askProject(opts.project, {
            filter: opts.filter,
            questions,
          });
          if (isJsonMode()) return printJson(res);
          console.log(
            `Matched ${res.data.matchedTwins} of ${res.data.totalTwins} respondents\n`
          );
          printAnswers(questions, res.data.answers);
          return;
        }

        // Audience mode (default)
        if (!opts.audience && !opts.audienceId) {
          printError(
            "Provide --audience, --audience-id, --project, or --twin."
          );
          process.exit(1);
        }

        if (opts.type === "choices") {
          if (!opts.choices) {
            printError("--choices is required when using --type choices");
            process.exit(1);
          }
          const res = await client.askChoices({
            audienceId: opts.audienceId,
            audiencePrompt: opts.audience,
            question: questions[0],
            choices: opts.choices.split(",").map((c: string) => c.trim()),
            isMultipleChoice: opts.multipleChoice || false,
            sampleSize: opts.sampleSize,
          });
          if (isJsonMode()) return printJson(res);
          printChoices(res.data.choices);
          return;
        }

        // Open questions (default)
        const res = await client.askOpen({
          audienceId: opts.audienceId,
          audiencePrompt: opts.audience,
          questions: questions.length > 1 ? questions : undefined,
          question: questions.length === 1 ? questions[0] : undefined,
          sampleSize: opts.sampleSize,
        });
        if (isJsonMode()) return printJson(res);
        printAnswers(questions, res.data.answers);
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) {
            printJson({ error: err.code, message: err.message });
          } else {
            printError(`${err.message} (${err.code})`);
          }
          process.exit(1);
        }
        throw err;
      }
    });
}
