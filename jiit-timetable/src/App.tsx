import React, { useState } from "react";
import { callPythonFunction } from "./utils/pyodide";

const App: React.FC = () => {
	const [functionName, setFunctionName] = useState<string>("add");
	const [args, setArgs] = useState<string>("1, 2");
	const [result, setResult] = useState<string>("");

	const executeFunction = async () => {
		try {
			const parsedArgs = args.split(",").map((arg) => {
				const trimmed = arg.trim();
				if (!isNaN(Number(trimmed))) return Number(trimmed); // Convert to number if possible
				return trimmed; // Keep as string otherwise
			});
			const output = await callPythonFunction(functionName, parsedArgs);
			setResult(JSON.stringify(output));
		} catch (error) {
			setResult("Error executing Python function");
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100">
			<h1 className="text-2xl font-bold mb-4">
				React + Pyodide + Python Module
			</h1>
			<input
				type="text"
				value={functionName}
				onChange={(e) => setFunctionName(e.target.value)}
				placeholder="Function name (e.g., add)"
				className="border rounded p-2 w-96 mb-4"
			/>
			<input
				type="text"
				value={args}
				onChange={(e) => setArgs(e.target.value)}
				placeholder="Arguments (comma-separated, e.g., 1, 2)"
				className="border rounded p-2 w-96 mb-4"
			/>
			<button
				onClick={executeFunction}
				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			>
				Call Python Function
			</button>
			<pre className="mt-4 bg-gray-200 p-4 rounded w-96">Output: {result}</pre>
		</div>
	);
};

export default App;
