"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { PyodideInterface } from "pyodide";

const SchedulePage = dynamic(
	() =>
		Promise.resolve(() => {
			const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
			const [input, setInput] = useState("");
			const [result, setResult] = useState<string | null>(null);
			const [loading, setLoading] = useState(true);

			useEffect(() => {
				const initializePyodide = async () => {
					try {
						const { loadPyodide } = await import("pyodide");
						const py = await loadPyodide({
							indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
						});
						setPyodide(py);
					} catch (err) {
						console.error("Error loading Pyodide:", err);
					} finally {
						setLoading(false);
					}
				};

				initializePyodide();
			}, []);

			const handleRunPython = async () => {
				if (!pyodide) return;

				try {
					const pythonCode = `
def process_data(input):
    return f"Processed: {input}"

process_data('${input}')
      `;
					const output = await pyodide.runPythonAsync(pythonCode);
					setResult(output);
				} catch (error) {
					console.error("Error running Python code:", error);
				}
			};

			if (loading) {
				return <div>Loading Pyodide...</div>;
			}

			return (
				<div className="p-4">
					<h1 className="text-2xl font-bold mb-4">React + Pyodide</h1>
					<div className="flex gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Enter input"
							className="border p-2 rounded"
						/>
						<button
							onClick={handleRunPython}
							className="bg-blue-500 text-white px-4 py-2 rounded"
						>
							Run Python
						</button>
					</div>
					{result && <p className="mt-4">Result: {result}</p>}
				</div>
			);
		}),
	{ ssr: false }
);

export default SchedulePage;
