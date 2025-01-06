import { loadPyodide, PyodideInterface } from 'pyodide';

import { Subject } from '../types/subject';
import { YourTietable } from '../App';
let pyodideInstance: PyodideInterface | null = null;

// URL of the Python module file
const pythonModuleURL = '/script.py';

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
    
    // First load the BE62_creator module
    const creatorCode = await fetchPythonCode('/modules/BE62_creator.py');
    await pyodideInstance.runPython(creatorCode);

    const creatorCode128 = await fetchPythonCode('/modules/BE128_creator.py');
    await pyodideInstance.runPython(creatorCode128);
    
    // Then load and run the main script
    const pythonCode = await fetchPythonCode(pythonModuleURL);
    await pyodideInstance.runPython(pythonCode);
  }
  return pyodideInstance;
}

interface PythonFunctionArgs {
  time_table_json: YourTietable, 
  subject_json: Subject[], 
  batch: string, 
  electives_subject_codes: string[]
}

export async function callPythonFunction(functionName: string, args: PythonFunctionArgs): Promise<any> {
  const pyodide = await initializePyodide();
  try {
    console.log("Calling Python function with args:", args);
    const pythonFunction = pyodide.globals.get(functionName);
    if (!pythonFunction) {
      throw new Error(`Function ${functionName} not found in Python module`);
    }
    
    // Convert JavaScript objects to Python objects
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