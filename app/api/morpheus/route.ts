import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Extract data from the request
    const { message, history } = data;
    
    // Create the proper command to run the Python script
    const pythonExecutable = 'python';
    
    // Path to your morpheus_main.py script - updated with correct path
    const scriptPath = 'C:/Users/rgome/crewai-env/Scripts/drmz_agents/src/drmz/morpheus_main.py';
    
    // Log the current directory to help with debugging
    console.log('Current working directory:', process.cwd());
    console.log('Using script path:', scriptPath);
    
    // Safely stringify history to handle potential undefined/null values
    const historyString = JSON.stringify(history || []);
    
    // Ensure message is properly wrapped in quotes if it contains spaces
    const sanitizedMessage = (message || '').replace(/"/g, '\\"');
    
    // Set up arguments for the Python script
    const args: string[] = [
      scriptPath,
      '--message', sanitizedMessage,
      '--mode', 'chat',
      '--history', historyString
    ];
    
    console.log('Executing command with args:', args);
    
    // Execute the Python process
    const result = await executePythonScript(pythonExecutable, args);
    
    return NextResponse.json({
      success: true,
      response: result
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: "I apologize, but I've encountered an error in processing your request. The dream pathways are momentarily obscured."
      },
      { status: 500 }
    );
  }
}

async function executePythonScript(pythonExecutable: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use spawn to run the Python command
    const pythonProcess: ChildProcess = spawn(pythonExecutable, args, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1', // Ensures output is not buffered
        PYTHONIOENCODING: 'utf-8', // Ensures proper encoding
        PYTHONPATH: 'C:/Users/rgome/crewai-env/Scripts/drmz_agents/src'
      }
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    // Collect stdout data
    if (pythonProcess.stdout) {
      pythonProcess.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdoutData += chunk;
        console.log('Python stdout:', chunk);
      });
    }
    
    // Collect stderr data
    if (pythonProcess.stderr) {
      pythonProcess.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stderrData += chunk;
        console.error('Python stderr:', chunk);
      });
    }
    
    // Handle process completion
    pythonProcess.on('close', (code: number | null) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}: ${stderrData}`));
      } else {
        // Extract the final output from Morpheus
        // This assumes your script prints a specific output marker
        let finalOutput = stdoutData;
        
        // If output contains "=== MORPHEUS FINAL OUTPUT ===" marker, extract just that part
        const outputMarker = "=== MORPHEUS FINAL OUTPUT ===";
        const markerIndex = stdoutData.indexOf(outputMarker);
        if (markerIndex !== -1) {
          finalOutput = stdoutData.substring(markerIndex + outputMarker.length).trim();
        }
        
        // If no output, provide a fallback message
        if (!finalOutput.trim()) {
          finalOutput = "Morpheus is contemplating your message, but has not yet formed a response.";
        }
        
        resolve(finalOutput);
      }
    });
    
    // Handle process error
    pythonProcess.on('error', (error: Error) => {
      console.error('Failed to start Python process:', error);
      reject(error);
    });
  });
}