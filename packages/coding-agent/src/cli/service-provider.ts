/**
 * Service provider for CLI runtime dependency injection.
 *
 * DefaultCliServiceProvider creates the standard Pi services. Subclass or
 * pass a partial override to `createCliRuntime` to inject custom
 * implementations without rewriting the CLI orchestration glue.
 *
 * Each factory method receives the same arguments the default implementation
 * needs, so overrides have full context to decide what to construct.
 */

import type { AgentSessionRuntime, CreateAgentSessionRuntimeFactory } from "../core/agent-session-runtime.ts";
import { createAgentSessionRuntime } from "../core/agent-session-runtime.ts";
import type { CreateAgentSessionServicesOptions } from "../core/agent-session-services.ts";
import { createAgentSessionFromServices, createAgentSessionServices } from "../core/agent-session-services.ts";
import { AuthStorage } from "../core/auth-storage.ts";
import { configureHttpDispatcher } from "../core/http-dispatcher.ts";
import { type NewSessionOptions, SessionManager } from "../core/session-manager.ts";
import { SettingsManager } from "../core/settings-manager.ts";
import { ProjectTrustStore } from "../core/trust-manager.ts";
import { runMigrations } from "../migrations.ts";
import { InteractiveMode, type InteractiveModeOptions, runPrintMode, runRpcMode } from "../modes/index.ts";
import { initTheme, stopThemeWatcher } from "../modes/interactive/theme/theme.ts";

export interface InteractiveModeHost {
	init(): Promise<void>;
	run(): Promise<void>;
	stop(): void;
}

export class DefaultCliServiceProvider {
	createAuthStorage(): AuthStorage {
		return AuthStorage.create();
	}

	createSettingsManager(cwd: string, agentDir: string, options?: { projectTrusted?: boolean }): SettingsManager {
		return SettingsManager.create(cwd, agentDir, options);
	}

	createSessionManager(cwd: string, sessionDir?: string, options?: NewSessionOptions): SessionManager {
		return SessionManager.create(cwd, sessionDir, options);
	}

	createTrustStore(agentDir: string): ProjectTrustStore {
		return new ProjectTrustStore(agentDir);
	}

	runMigrations(cwd: string): { migratedAuthProviders: string[]; deprecationWarnings: string[] } {
		return runMigrations(cwd);
	}

	async createServices(options: CreateAgentSessionServicesOptions) {
		return createAgentSessionServices(options);
	}

	async createSessionFromServices(
		...args: Parameters<typeof createAgentSessionFromServices>
	): ReturnType<typeof createAgentSessionFromServices> {
		return createAgentSessionFromServices(...args);
	}

	async createRuntime(
		factory: CreateAgentSessionRuntimeFactory,
		options: { cwd: string; agentDir: string; sessionManager: SessionManager },
	): Promise<AgentSessionRuntime> {
		return createAgentSessionRuntime(factory, options);
	}

	configureHttpDispatcher(idleTimeoutMs?: number): void {
		configureHttpDispatcher(idleTimeoutMs);
	}

	initTheme(theme?: string, watchEnabled?: boolean): void {
		initTheme(theme, watchEnabled);
	}

	stopThemeWatcher(): void {
		stopThemeWatcher();
	}

	createInteractiveMode(runtime: AgentSessionRuntime, options: InteractiveModeOptions): InteractiveModeHost {
		return new InteractiveMode(runtime, options);
	}

	async runPrintMode(...args: Parameters<typeof runPrintMode>): ReturnType<typeof runPrintMode> {
		return runPrintMode(...args);
	}

	async runRpcMode(...args: Parameters<typeof runRpcMode>): ReturnType<typeof runRpcMode> {
		return runRpcMode(...args);
	}
}

export type CliServiceProvider = DefaultCliServiceProvider;
