import "dotenv/config";
import { categorizeExpense } from "./categorizer.js";

const input = process.argv.slice(2).join(" ") || "electricity 200";

console.log(`input=${input}`);
const result = await categorizeExpense(input);
console.log("\n--- result ---");
console.log(`category=${result.category}`);
console.log(`prompt_tokens=${result.promptTokens ?? "n/a"}`);
console.log(`completion_tokens=${result.completionTokens ?? "n/a"}`);
console.log(`total_tokens=${result.totalTokens ?? "n/a"}`);
console.log(`cost_usd=${result.costUsd !== null ? result.costUsd.toFixed(8) : "n/a"}`);
console.log("\n--- timings ---");
console.log(`first_token_ms=${result.firstTokenMs ?? "n/a"}`);
console.log(`total_ms=${result.totalMs}`);
