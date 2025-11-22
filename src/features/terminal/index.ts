// Terminal Feature Barrel Export
// Components
export { default as Terminal } from './components/Terminal'
export { default as TerminalSection } from './components/TerminalSection'
export { default as GameInterface } from './components/GameInterface'
export { default as GameProgress } from './components/GameProgress'
export { default as VictoryScreen } from './components/VictoryScreen'
export { default as PasswordHintBubble } from './components/PasswordHintBubble'

// Services/Utilities
export { loadTerminalCommands, processCommand, getCommandType } from './services/terminalCommands'
export { FakeFileSystem } from './services/fakeFilesystem'
export { terminalCache } from './services/terminalCache'
export { createTerminalAutocomplete } from './services/terminalAutocomplete'
export { GameStateManager } from './services/gameState'
export { ProgressTracker } from './services/progressTracker'
export { HintSystem } from './services/hintSystem'
export { initTerminalHints } from './services/terminalHint'
export { PermissionSystem, createPermissionSystem } from './services/permissionSystem'
export { HiddenFileSystemManager } from './services/hiddenFileSystem'
export { PuzzleContentGenerator } from './services/puzzleContentGenerator'

// Commands
export * from './services/commands/fileAnalysis'
export * from './services/commands/networkAnalysis'
export * from './services/commands/permissionManagement'
export * from './services/commands/processManagement'
export * from './services/commands/suidBinary'

// Types
export type { TerminalCommands, CommandContext } from './services/terminalCommands'
export type { FileSystem } from './services/fakeFilesystem'
export type { TerminalSession } from './services/terminalCache'
export type { TerminalAutocomplete, AutocompleteResult } from './services/terminalAutocomplete'
