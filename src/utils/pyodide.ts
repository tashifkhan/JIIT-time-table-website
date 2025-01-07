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
    console.log('Initializing Pyodide...');
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      fullStdLib: false,
    });
    
    // First load the BE62_creator and BE128_creator modules
    console.log('Loading BE62_creator module...');
    const creatorCode = await fetchPythonCode('/modules/BE62_creator.py');
    await pyodideInstance.runPython(creatorCode);

    console.log('Loading BE128_creator module...');
    const creatorCode128 = await fetchPythonCode('/modules/BE128_creator.py');
    await pyodideInstance.runPython(creatorCode128);
    
    // Then load and run the main script that exposes the functions
    console.log('Loading main script...');
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
    console.log("Calling Python function:", functionName);
    const pythonFunction = pyodide.globals.get(functionName);
    console.log('Python function:', pythonFunction, 'type:', typeof pythonFunction);
    
    if (!pythonFunction || typeof pythonFunction !== 'function') {
      console.error('Available globals:', Object.keys(pyodide.globals.toJs()));
      throw new Error(`Function ${functionName} is not a valid Python function`);
    }
    // if (!pythonFunction) {
    //   console.error(`Function ${functionName} not found. Available functions:`, pyodide.globals.get('dir')());
    //   throw new Error(`Function ${functionName} not found in Python module`);
    // }
    console.log("hello")
    
    // Convert JavaScript objects to Python objects
    const pyTimeTable = pyodide.toPy(args.time_table_json);
    console.log('pyTimeTable:', pyTimeTable);
    const pySubjects = pyodide.toPy(args.subject_json);
    console.log('pySubjects:', pySubjects);
    const pyBatch = pyodide.toPy(args.batch);
    console.log('pyBatch:', pyBatch);
    const pyElectives = pyodide.toPy(args.electives_subject_codes);
    console.log('pyElectives:', pyElectives);
    
    const result = pythonFunction(pyTimeTable, pySubjects, pyBatch, pyElectives);
    return result.toJs();
  } catch (error) {
    console.error('Error calling Python function:', error);
    throw error;
  }
}