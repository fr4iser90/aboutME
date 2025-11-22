// SUID Binary Command Handler
// Handles execution of SUID binaries for privilege escalation

import { CommandContext } from '../terminalCommands'

export interface SuidBinaryResult {
  success: boolean
  output?: string
  error?: string
}

/**
 * Execute SUID binary with arguments
 * This simulates privilege escalation through SUID binaries
 */
export async function suidBinaryCommand(
  args: string[],
  context: CommandContext
): Promise<SuidBinaryResult> {
  try {
    // Check if we have the required arguments
    if (args.length === 0) {
      return {
        success: false,
        error: 'Usage: ./Documents/server_stuff/backup_tool.sh <file_path>'
      }
    }

    const targetFile = args[0]
    console.log('SUID Binary execution:', { targetFile, currentUser: context.filesystem.getCurrentUser() })

    // Simulate SUID binary execution - runs as root regardless of current user
    // This is the core of the privilege escalation challenge
    
    // Execute the SUID binary logic
    // The backup_tool.sh script reads any file as root
    const fileContent = await context.filesystem.cat(targetFile)
    
    if (fileContent.success) {
      // Simulate the backup tool output
      const output = `Backing up: ${targetFile}\n${fileContent.content || fileContent.error || 'File content not available'}`
      
      return {
        success: true,
        output: output
      }
    } else {
      return {
        success: false,
        error: fileContent.error || `Error reading file: ${targetFile}`
      }
    }

  } catch (error) {
    console.error('SUID Binary execution error:', error)
    return {
      success: false,
      error: `Error executing SUID binary: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
