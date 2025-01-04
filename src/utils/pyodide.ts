import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;

// URL of the Python module file
const pythonModuleURL = '/_creator.py';

async function fetchPythonCode(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Python module from ${url}: ${response.statusText}`);
  }
  return response.text();
}

export async function initializePyodide() {
  if (!pyodideInstance) {
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      fullStdLib: false,
    });
    const pythonCode = await fetchPythonCode(pythonModuleURL);
    await pyodideInstance.runPython(pythonCode);
  }
  return pyodideInstance;
}

export async function callPythonFunction(functionName: string, args: any[]): Promise<any> {
  const pyodide = await initializePyodide();
  try {
    const pythonFunction = pyodide.globals.get(functionName);
    if (!pythonFunction) {
      throw new Error(`Function ${functionName} not found in Python module`);
    }
    return pythonFunction(...args);
  } catch (error) {
    console.error('Error calling Python function:', error);
    throw error;
  }
}