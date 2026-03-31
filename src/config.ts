import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".ov");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  apiKey?: string;
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "https://api.originalvoices.ai";

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function readConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function getApiKey(): string | undefined {
  // Priority: env var > config file
  return process.env.OV_API_KEY || readConfig().apiKey;
}

export function getBaseUrl(): string {
  return process.env.OV_BASE_URL || readConfig().baseUrl || DEFAULT_BASE_URL;
}

export function saveApiKey(apiKey: string): void {
  const config = readConfig();
  config.apiKey = apiKey;
  writeConfig(config);
}

export function saveBaseUrl(baseUrl: string): void {
  const config = readConfig();
  config.baseUrl = baseUrl;
  writeConfig(config);
}

export function clearConfig(): void {
  writeConfig({});
}
