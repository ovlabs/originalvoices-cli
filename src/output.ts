import chalk from "chalk";
import Table from "cli-table3";

let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(
  headers: string[],
  rows: string[][]
): void {
  const table = new Table({
    head: headers.map((h) => chalk.bold(h)),
    style: { head: [] },
  });
  for (const row of rows) {
    table.push(row);
  }
  console.log(table.toString());
}

export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}

export function printError(message: string): void {
  console.error(chalk.red(message));
}

export function printWarning(message: string): void {
  console.log(chalk.yellow(message));
}

export function printAnswers(
  questions: string[],
  answers: { answer: string; confidence: number }[][]
): void {
  for (let qi = 0; qi < questions.length; qi++) {
    if (questions.length > 1) {
      console.log(chalk.bold(`\nQ${qi + 1}: ${questions[qi]}`));
      console.log(chalk.dim("─".repeat(60)));
    }

    const qAnswers = answers[qi] || [];
    for (let i = 0; i < qAnswers.length; i++) {
      const a = qAnswers[i];
      const conf = chalk.dim(`(${Math.round(a.confidence * 100)}%)`);
      console.log(`  ${chalk.cyan(`${i + 1}.`)} ${a.answer} ${conf}`);
    }
  }
  console.log();
}

export function printChoices(
  choices: { choice: string; percentage: number }[]
): void {
  const sorted = [...choices].sort((a, b) => b.percentage - a.percentage);
  for (const c of sorted) {
    const pct = `${Math.round(c.percentage)}%`;
    const bar = "█".repeat(Math.round(c.percentage / 2));
    console.log(`  ${chalk.cyan(pct.padStart(4))} ${chalk.dim(bar)} ${c.choice}`);
  }
  console.log();
}
