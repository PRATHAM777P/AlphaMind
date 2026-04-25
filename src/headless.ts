#!/usr/bin/env bun
/**
 * Headless mode for AlphaMind — non-interactive entry point for Claude Code integration.
 *
 * Input: JSON on stdin with { query: string, maxIterations?: number, model?: string }
 *   OR: command-line argument as the query string
 *
 * Output: JSON on stdout with { answer, tools_used, iterations, totalTime, tokenUsage }
 *
 * Usage:
 *   echo '{"query":"Research AAPL"}' | bun run src/headless.ts
 *   bun run src/headless.ts "Research AAPL"
 *   bun run src/headless.ts --query "Research AAPL" --max-iterations 5
 */
import { config } from 'dotenv';
import { Agent } from './agent/agent.js';
import type { DoneEvent } from './agent/types.js';

// Load environment variables
config({ quiet: true });

interface HeadlessInput {
  query: string;
  maxIterations?: number;
  model?: string;
}

interface HeadlessOutput {
  answer: string;
  tools_used: string[];
  iterations: number;
  totalTime: number;
  tokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  error?: string;
}

async function parseInput(): Promise<HeadlessInput> {
  const args = process.argv.slice(2);

  // Check for --query flag
  const queryIdx = args.indexOf('--query');
  if (queryIdx !== -1 && args[queryIdx + 1]) {
    const maxIterIdx = args.indexOf('--max-iterations');
    return {
      query: args[queryIdx + 1],
      maxIterations: maxIterIdx !== -1 ? parseInt(args[maxIterIdx + 1], 10) : undefined,
    };
  }

  // Check for bare argument (no flags)
  if (args.length > 0 && !args[0].startsWith('-')) {
    return { query: args.join(' ') };
  }

  // Try reading JSON from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const stdinData = Buffer.concat(chunks).toString('utf-8').trim();
  if (!stdinData) {
    throw new Error('No input provided. Pass a query as argument or pipe JSON to stdin.');
  }
  return JSON.parse(stdinData);
}

async function main() {
  let input: HeadlessInput;
  try {
    input = await parseInput();
  } catch (e) {
    const output: HeadlessOutput = {
      answer: '',
      tools_used: [],
      iterations: 0,
      totalTime: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log(JSON.stringify(output));
    process.exit(1);
  }

  const agent = Agent.create({
    model: input.model,
    maxIterations: input.maxIterations ?? 10,
  });

  const toolsUsed = new Set<string>();
  let result: DoneEvent | null = null;

  // Suppress all non-JSON output (agent logs go to stderr)
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args) => process.stderr.write(args.join(' ') + '\n');
  console.error = (...args) => process.stderr.write(args.join(' ') + '\n');

  try {
    for await (const event of agent.run(input.query)) {
      // Track tool usage
      if (event.type === 'tool_start') {
        toolsUsed.add(event.tool);
      }
      // Log progress to stderr so caller can monitor
      if (event.type === 'tool_start') {
        process.stderr.write(`[alphamind] tool: ${event.tool}\n`);
      }
      if (event.type === 'thinking') {
        process.stderr.write(`[alphamind] thinking: ${event.message.slice(0, 100)}\n`);
      }
      if (event.type === 'done') {
        result = event;
      }
    }
  } catch (e) {
    const output: HeadlessOutput = {
      answer: '',
      tools_used: Array.from(toolsUsed),
      iterations: 0,
      totalTime: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.warn = originalWarn;
    console.error = originalError;
    console.log(JSON.stringify(output));
    process.exit(1);
  }

  console.warn = originalWarn;
  console.error = originalError;

  const output: HeadlessOutput = {
    answer: result?.answer ?? '',
    tools_used: Array.from(toolsUsed),
    iterations: result?.iterations ?? 0,
    totalTime: result?.totalTime ?? 0,
    tokenUsage: result?.tokenUsage,
  };

  console.log(JSON.stringify(output));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
