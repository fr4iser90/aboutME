/**
 * Unit tests for TerminalEditor component
 */

import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TerminalEditor from '@/features/editor/components/TerminalEditor/TerminalEditor'

// Mock fetch
global.fetch = jest.fn()

describe('TerminalEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<TerminalEditor />)
    expect(screen.getByText(/Loading terminal configuration/i)).toBeInTheDocument()
  })

  it('should render setup mode when files do not exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        filesExist: false,
        filesStatus: {
          'terminal-user-info.json': false,
          'terminal-commands.json': false,
          'terminal.json': false,
          'fake-os-structure.json': false,
          'permission-rules.json': false,
          'puzzle-files.json': false
        },
        files: null
      })
    })

    render(<TerminalEditor />)

    await waitFor(() => {
      expect(screen.getByText(/Terminal Setup/i)).toBeInTheDocument()
      expect(screen.getByText(/Generate from Template/i)).toBeInTheDocument()
    })
  })

  it('should render edit mode when files exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        filesExist: true,
        filesStatus: {
          'terminal-user-info.json': true,
          'terminal-commands.json': true,
          'terminal.json': true,
          'fake-os-structure.json': true,
          'permission-rules.json': true,
          'puzzle-files.json': true
        },
        files: {}
      })
    })

    render(<TerminalEditor />)

    await waitFor(() => {
      expect(screen.getByText(/Edit Existing Terminal Files/i)).toBeInTheDocument()
    })
  })

  it('should display error message on API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<TerminalEditor />)

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument()
    })
  })
})

