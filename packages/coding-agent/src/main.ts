/**
 * Main entry point for the coding agent CLI.
 *
 * This thin wrapper preserves the package's default CLI behavior while the
 * composable runtime pieces live in `cli/runtime.ts` for custom entrypoints.
 */

import { type MainOptions, runCli } from "./cli/runtime.ts";

export type { AppMode, CliRuntime, MainOptions } from "./cli/runtime.ts";
export {
	buildSessionOptions,
	createCliRuntime,
	prepareInitialMessage,
	resolveAppMode,
	resolveCliPaths,
	runCli,
	runCliMode,
	toPrintOutputMode,
} from "./cli/runtime.ts";
export type { CliServiceProvider, InteractiveModeHost } from "./cli/service-provider.ts";
export { DefaultCliServiceProvider } from "./cli/service-provider.ts";

export async function main(args: string[], options?: MainOptions): Promise<void> {
	return runCli(args, options);
}
