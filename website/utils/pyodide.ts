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
    
    // Install micropip and load the parser wheel
    await pyodideInstance.loadPackage('micropip');
    const micropip = pyodideInstance.pyimport('micropip');
    
    // Build absolute URL for the wheel file
    const wheelPath = '/parser/jiit_timetable_parser-0.1.0-py3-none-any.whl';
    const wheelURL = `${window.location.origin}${wheelPath}`;
    await micropip.install(wheelURL);
    
    // Import the main module to make functions available
    await pyodideInstance.runPython(`
from main import create_time_table, compare_timetables, create_and_compare_timetable
    `);
    
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

interface TimetableArgs {
  time_table_json: YourTietable, 
  subject_json: Subject[], 
  batch: string, 
  electives_subject_codes: string[]
}

/**
 * Create a personalized timetable using the unified create_time_table function.
 * This replaces the old function selector logic.
 */
export async function callTimeTableCreator(
  campus: string,
  year: string,
  args: TimetableArgs
): Promise<any> {
  console.log('callTimeTableCreator called with:', { campus, year, batch: args.batch, electives: args.electives_subject_codes });
  const pyodide = (await initializePyodide()) as PyodideInterface;
  try {
    console.log('Pyodide initialized, getting create_time_table function...');
    const createFn = pyodide.globals.get('create_time_table');
    if (!createFn || typeof createFn !== 'function') {
      console.error('create_time_table function not available');
      console.log('Available globals:', Object.keys(pyodide.globals.toJs()));
      throw new Error('create_time_table function not available');
    }
    
    console.log('Converting arguments to Python...');
    const pyCampus = pyodide.toPy(campus);
    const pyYear = pyodide.toPy(year);
    const pyTimeTable = pyodide.toPy(args.time_table_json);
    const pySubjects = pyodide.toPy(args.subject_json);
    const pyBatch = pyodide.toPy(args.batch);
    const pyElectives = pyodide.toPy(args.electives_subject_codes);
    
    console.log('Calling create_time_table...');
    const result = createFn(pyCampus, pyYear, pyTimeTable, pySubjects, pyBatch, pyElectives);
    console.log('create_time_table returned, converting to JS...');
    const jsResult = result.toJs();
    console.log('Result:', jsResult);
    return jsResult;
  } catch (error) {
    console.error('Error calling create_time_table:', error);
    throw error;
  }
}

interface TimetableParams {
  campus: string;
  year: string;
  time_table_json: any;
  subject_json: any[];
  batch: string;
  electives_subject_codes?: string[];
}

/**
 * Create two timetables and compare them using the unified function.
 * This replaces the old multi-function approach in compare-timetables.
 */
export async function callCompareAndCreate(
  params_list: [TimetableParams, TimetableParams]
): Promise<any> {
  const pyodide = (await initializePyodide()) as PyodideInterface;
  try {
    const compareFn = pyodide.globals.get('create_and_compare_timetable');
    if (!compareFn || typeof compareFn !== 'function') {
      throw new Error('create_and_compare_timetable function not available');
    }
    
    const pyParams = pyodide.toPy(params_list);
    const result = compareFn(pyParams);
    return result.toJs();
  } catch (error) {
    console.error('Error calling create_and_compare_timetable:', error);
    throw error;
  }
}

/**
 * Compare two already-generated timetables.
 */
export async function callCompareTimetables(
  timetable1: any,
  timetable2: any
): Promise<any> {
  const pyodide = (await initializePyodide()) as PyodideInterface;
  try {
    const compareFn = pyodide.globals.get('compare_timetables');
    if (!compareFn || typeof compareFn !== 'function') {
      throw new Error('compare_timetables function not available');
    }
    
    const pyTT1 = pyodide.toPy(timetable1);
    const pyTT2 = pyodide.toPy(timetable2);
    const result = compareFn(pyTT1, pyTT2);
    return result.toJs();
  } catch (error) {
    console.error('Error calling compare_timetables:', error);
    throw error;
  }
}

/**
 * @deprecated Use callTimeTableCreator instead.
 * Legacy function for backward compatibility.
 */
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