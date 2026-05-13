import "dotenv/config";
import { categorizeExpense } from "./categorizer.js";

const input = process.argv.slice(2).join(" ") || "electricity 200";

console.log(`input=${input}`);
const result = await categorizeExpense(input);
console.log("\n--- timings ---");
console.log(`category=${result.category}`);
console.log(`first_token_ms=${result.firstTokenMs ?? "n/a"}`);
console.log(`total_ms=${result.totalMs}`);
