"use client";

import React, { useState, useEffect } from "react";
import { loadPyodide, PyodideInterface } from "pyodide";

function SchedulePage() {
	const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
	const [input, setInput] = useState("");
	const [result, setResult] = useState(null);

	useEffect(() => {
		const initializePyodide = async () => {
			const py = await loadPyodide();
			setPyodide(py);
		};
		initializePyodide();
	}, []);

	const handleRunPython = async () => {
		if (pyodide) {
			try {
				// Define your Python code
				const pythonCode = `
def process_data(input):
    return f"Processed: {input}"

process_data('${input}')
        `;
				// Run the Python code
				const output = await pyodide.runPythonAsync(pythonCode);
				setResult(output);
			} catch (error) {
				console.error("Error running Python code:", error);
			}
		} else {
			console.error("Pyodide is not initialized");
		}
	};

	return (
		<div>
			<h1>React + Pyodide</h1>
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Enter input"
			/>
			<button onClick={handleRunPython}>Run Python</button>
			{result && <p>Result: {result}</p>}
		</div>
	);
}

export default SchedulePage;
