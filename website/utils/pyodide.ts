import type { PyodideInterface } from 'pyodide';
import { Subject } from '../types/subject';
import { YourTietable } from '../types';
import { useEffect, useState } from 'react';

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading = false;
let pyodideLoaded = false;
let pyodideError: Error | null = null;
let listeners: (() => void)[] = [];

declare global {
  interface Window {
    loadPyodide: any;
  }
}

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
  if (pyodideLoaded) return pyodideInstance;
  if (pyodideLoading) {
    // Wait for loading to finish
    return new Promise((resolve, reject) => {
      const check = () => {
        if (pyodideLoaded) resolve(pyodideInstance);
        else if (pyodideError) reject(pyodideError);
        else setTimeout(check, 50);
      };
      check();
    });
  }
  pyodideLoading = true;
  notifyListeners();
  try {
    if (!window.loadPyodide) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
      script.async = true;
      document.body.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    pyodideInstance = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      fullStdLib: false,
    });
    if (!pyodideInstance) {
        throw new Error("Pyodide failed to initialize");
    }
    const pythonCode = await fetchPythonCode(pythonModuleURL);
    await pyodideInstance.runPython(pythonCode);
    pyodideLoaded = true;
    pyodideLoading = false;
    pyodideError = null;
    notifyListeners();
    return pyodideInstance;
  } catch (err) {
    pyodideError = err as Error;
    pyodideLoading = false;
    notifyListeners();
    throw err;
  }
}

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

export function usePyodideStatus() {
  const [status, setStatus] = useState<{
    loading: boolean;
    loaded: boolean;
    error: Error | null;
  }>({ loading: pyodideLoading, loaded: pyodideLoaded, error: pyodideError });

  useEffect(() => {
    const cb = () => {
      setStatus({ loading: pyodideLoading, loaded: pyodideLoaded, error: pyodideError });
    };
    listeners.push(cb);
    return () => {
      listeners = listeners.filter((l) => l !== cb);
    };
  }, []);

  return status;
}

interface PythonFunctionArgs {
  time_table_json: YourTietable, 
  subject_json: Subject[], 
  batch: string, 
  electives_subject_codes: string[]
}

export async function callPythonFunction(functionName: string, args: PythonFunctionArgs): Promise<any> {
  const pyodide = (await initializePyodide()) as PyodideInterface;
  try {
    const pythonFunction = pyodide.globals.get(functionName);
    if (!pythonFunction || typeof pythonFunction !== 'function') {
      console.error('Available globals:', Object.keys(pyodide.globals.toJs()));
      throw new Error(`Function ${functionName} is not a valid Python function`);
    }
    const pyTimeTable = pyodide.toPy(args.time_table_json);
    const pySubjects = pyodide.toPy(args.subject_json);
    const pyBatch = pyodide.toPy(args.batch);
    const pyElectives = pyodide.toPy(args.electives_subject_codes);
    const result = pythonFunction(pyTimeTable, pySubjects, pyBatch, pyElectives);
    return result.toJs();
  } catch (error) {
    console.error('Error calling Python function:', error);
    throw error;
  }
}