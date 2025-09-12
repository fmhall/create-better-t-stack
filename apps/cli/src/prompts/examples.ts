import { isCancel, multiselect } from "@clack/prompts";
import { DEFAULT_CONFIG } from "../constants";
import type { API, Backend, Database, Examples, Frontend } from "../types";
import {
	isExampleAIAllowed,
	isExampleMonetizedAIAllowed,
	isExampleTodoAllowed,
} from "../utils/compatibility-rules";
import { exitCancelled } from "../utils/errors";

export async function getExamplesChoice(
	examples?: Examples[],
	database?: Database,
	frontends?: Frontend[],
	backend?: Backend,
	api?: API,
) {
	if (examples !== undefined) return examples;

	if (api === "none") {
		if (backend === "convex") {
			return ["todo", "monetized-ai"];
		}
		return ["monetized-ai"];
	}

	if (backend === "convex") {
		return ["todo", "monetized-ai"];
	}

	if (backend === "none") {
		return ["monetized-ai"];
	}

	if (database === "none") return ["monetized-ai"];

	let response: Examples[] | symbol = [];
	const options: { value: Examples; label: string; hint: string }[] = [];

	if (isExampleTodoAllowed(backend, database)) {
		options.push({
			value: "todo" as const,
			label: "Todo App",
			hint: "A simple CRUD example app",
		});
	}

	if (isExampleAIAllowed(backend, frontends ?? [])) {
		options.push({
			value: "ai" as const,
			label: "AI Chat",
			hint: "A simple AI chat interface using AI SDK",
		});
	}

	if (isExampleMonetizedAIAllowed(backend, frontends ?? [])) {
		options.push({
			value: "monetized-ai" as const,
			label: "Monetized AI Chat",
			hint: "AI chat with credit system and monetization features",
		});
	}

	if (options.length === 0) return [];

	response = await multiselect<Examples>({
		message: "Include examples",
		options: options,
		required: false,
		initialValues: DEFAULT_CONFIG.examples?.filter((ex) =>
			options.some((o) => o.value === ex),
		),
	});

	if (isCancel(response)) return exitCancelled("Operation cancelled");

	return response;
}
