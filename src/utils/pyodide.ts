import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;

const pythonModuleCode = `
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def greet(name):
    return f"Hello, {name}!"
`;

export async function initializePyodide() {
  if (!pyodideInstance) {
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      fullStdLib: false,
    });
    await pyodideInstance.runPython(pythonModuleCode);
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