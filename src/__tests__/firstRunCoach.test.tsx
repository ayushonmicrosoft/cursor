import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useUIStore } from '../stores/uiStore'
import { FirstRunCoach } from '../components/editor/FirstRunCoach'
import { useElementsStore } from '../stores/elementsStore'
import { useEmployeeStore } from '../stores/employeeStore'
import type { DeskElement } from '../types/elements'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const STORAGE_KEY = 'firstRunWelcomeSeen'
const DEMO_DISMISSED_KEY = 'floocraft.firstRunDemoDismissed'
const ONBOARDING_COMPLETED_KEY = 'floorcraft.onboardingCompleted'
const ONBOARDING_STEP_KEY = 'floocraft.onboardingStep'

describe('FirstRunCoach', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorageMock.clear()

    // Reset store states
    useUIStore.setState({
      shortcutsOverlayOpen: false,
      commandPaletteOpen: false,
      firstRunCoachOpen: false,
    })
    useElementsStore.setState({ elements: {} })
    useEmployeeStore.setState({ employees: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('localStorage persistence', () => {
    it('shows tour when localStorage is empty', () => {
      render(<FirstRunCoach />)
      // Tour should be visible (not dismissed)
      expect(screen.queryByRole('dialog')).toBeInTheDocument()
    })

    it('does not show tour when firstRunWelcomeSeen is set', () => {
      localStorageMock.setItem(STORAGE_KEY, '1')
      render(<FirstRunCoach />)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('does not show tour when onboardingCompleted is set', () => {
      localStorageMock.setItem(ONBOARDING_COMPLETED_KEY, '1')
      render(<FirstRunCoach />)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('sets firstRunWelcomeSeen when tour is dismissed', () => {
      render(<FirstRunCoach />)
      expect(screen.queryByRole('dialog')).toBeInTheDocument()

      // Click skip
      const skipButton = screen.getByRole('button', { name: /dismiss welcome card/i })
      fireEvent.click(skipButton)

      expect(localStorageMock.getItem(STORAGE_KEY)).toBe('1')
      expect(localStorageMock.getItem(ONBOARDING_COMPLETED_KEY)).toBe('1')
    })

    it('sets onboardingCompleted when Done is clicked on last step', async () => {
      render(<FirstRunCoach />)

      // Navigate to last step by clicking Next multiple times
      const nextButton = screen.getByRole('button', { name: /next/i })

      // 15 steps total, need to click Next 14 times to reach last step
      for (let i = 0; i < 14; i++) {
        fireEvent.click(nextButton)
      }

      // Now click Done
      const doneButton = screen.getByRole('button', { name: /done/i })
      fireEvent.click(doneButton)

      expect(localStorageMock.getItem(ONBOARDING_COMPLETED_KEY)).toBe('1')
    })

    it('preserves current step in localStorage', () => {
      render(<FirstRunCoach />)

      // Navigate forward a few steps
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton) // step 2
      fireEvent.click(nextButton) // step 3

      expect(localStorageMock.getItem(ONBOARDING_STEP_KEY)).toBe('2')
    })

    it('resumes from saved step on remount', () => {
      // Simulate a return visit with saved progress
      localStorageMock.setItem(ONBOARDING_STEP_KEY, '3')
      // Note: not completed yet

      const { unmount } = render(<FirstRunCoach />)
      unmount()

      // Re-render
      render(<FirstRunCoach />)

      // Should show step 4 (step index 3 + 1 for display)
      expect(screen.getByText(/step 4 of/i)).toBeInTheDocument()
    })
  })

  describe('tour navigation', () => {
    it('advances to next step on Next click', () => {
      render(<FirstRunCoach />)

      expect(screen.getByText(/step 1 of/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText(/step 2 of/i)).toBeInTheDocument()
    })

    it('goes back on Back click', () => {
      render(<FirstRunCoach />)

      // Go to step 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText(/step 2 of/i)).toBeInTheDocument()

      // Go back
      fireEvent.click(screen.getByRole('button', { name: /back/i }))
      expect(screen.getByText(/step 1 of/i)).toBeInTheDocument()
    })

    it('shows Back button only after first step', () => {
      render(<FirstRunCoach />)

      expect(screen.queryByText(/back/i)).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('displays step dots that are clickable', () => {
      render(<FirstRunCoach />)

      const dots = screen.getAllByRole('button', { name: /go to step/i })
      expect(dots.length).toBeGreaterThan(0)

      // Click step 3
      fireEvent.click(dots[2])

      expect(screen.getByText(/step 3 of/i)).toBeInTheDocument()
    })

    it('shows Done button on last step', () => {
      render(<FirstRunCoach />)

      // Navigate to last step
      const dots = screen.getAllByRole('button', { name: /go to step/i })
      fireEvent.click(dots[dots.length - 1])

      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).toBeNull()
    })
  })

  describe('keyboard navigation', () => {
    it('closes on Escape key', () => {
      render(<FirstRunCoach />)

      expect(screen.queryByRole('dialog')).toBeInTheDocument()

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      })

      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('advances on ArrowRight key', () => {
      render(<FirstRunCoach />)

      expect(screen.getByText(/step 1 of/i)).toBeInTheDocument()

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight' }),
        )
      })

      expect(screen.getByText(/step 2 of/i)).toBeInTheDocument()
    })

    it('goes back on ArrowLeft key', () => {
      render(<FirstRunCoach />)

      // Go to step 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText(/step 2 of/i)).toBeInTheDocument()

      // Go back with arrow key
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      })

      expect(screen.getByText(/step 1 of/i)).toBeInTheDocument()
    })
  })

  describe('progress bar', () => {
    it('shows progress bar indicating current step', () => {
      render(<FirstRunCoach />)

      // Progress bar container should exist
      const dialog = screen.getByRole('dialog')
      expect(dialog.querySelector('.bg-blue-600')).toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('opens command palette when Open palette is clicked', () => {
      render(<FirstRunCoach />)

      // Navigate to last step
      const dots = screen.getAllByRole('button', { name: /go to step/i })
      fireEvent.click(dots[dots.length - 1])

      fireEvent.click(screen.getByText(/open palette/i))

      expect(useUIStore.getState().commandPaletteOpen).toBe(true)
    })
  })

  describe('forceOpen prop', () => {
    it('shows tour when forceOpen is true despite localStorage', () => {
      localStorageMock.setItem(ONBOARDING_COMPLETED_KEY, '1')

      render(<FirstRunCoach forceTourOpen={true} />)

      expect(screen.queryByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('step content', () => {
    it('shows welcome message on first step', () => {
      render(<FirstRunCoach />)

      expect(screen.getByText(/welcome to/i)).toBeInTheDocument()
    })

    it('shows tool selection guidance', () => {
      render(<FirstRunCoach />)

      fireEvent.click(screen.getByRole('button', { name: /next/i })) // step 2

      expect(screen.getByText(/choose your tool/i)).toBeInTheDocument()
    })

    it('shows export guidance on relevant step', () => {
      render(<FirstRunCoach />)

      // Navigate to export step (step 13)
      const dots = screen.getAllByRole('button', { name: /go to step/i })
      fireEvent.click(dots[12]) // 0-indexed, so 12 is step 13

      // Check for the title "Export & Share"
      expect(screen.getByText(/export & share/i)).toBeInTheDocument()
    })
  })
})

describe('FirstRunCoach Demo Seeder', () => {
  beforeEach(() => {
    localStorageMock.clear()
    useElementsStore.setState({ elements: {} })
    useEmployeeStore.setState({ employees: {} })
    useUIStore.setState({ firstRunCoachOpen: false })
  })

  it('shows demo seeder when canvas is empty', () => {
    render(<FirstRunCoach />)

    expect(screen.getByText(/new to oandocraft/i)).toBeInTheDocument()
  })

  it('does not show demo seeder when elements exist', () => {
    const desk: DeskElement = {
      id: 'el-1',
      type: 'desk',
      x: 0,
      y: 0,
      width: 40,
      height: 24,
      rotation: 0,
      locked: false,
      groupId: null,
      zIndex: 0,
      label: 'Desk',
      visible: true,
      style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
      deskId: 'D-1',
      assignedEmployeeId: null,
      capacity: 1,
    }
    useElementsStore.setState({
      elements: { 'el-1': desk },
    })

    render(<FirstRunCoach />)

    expect(screen.queryByText(/new to oandocraft/i)).toBeNull()
  })

  it('does not show demo seeder when demo was dismissed', () => {
    localStorageMock.setItem(DEMO_DISMISSED_KEY, '1')

    render(<FirstRunCoach />)

    expect(screen.queryByText(/new to oandocraft/i)).toBeNull()
  })

  it('sets demo dismissed when Start from scratch is clicked', () => {
    render(<FirstRunCoach />)

    fireEvent.click(screen.getByText(/start from scratch/i))

    expect(localStorageMock.getItem(DEMO_DISMISSED_KEY)).toBe('1')
  })
})
