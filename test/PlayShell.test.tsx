import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayShell from '@/components/player/PlayShell'

// Mock heavy implementations to prevent JSDOM crashing
vi.mock('@/hooks/useMidiInput', () => ({
  useMidiInput: () => ({ activeNotes: new Set(), lastNote: null, midiError: null }) // explicitly stub out WebMIDI API requirements
}))
vi.mock('soundtouchjs', () => ({ PitchShifter: vi.fn(), getWebAudioNode: vi.fn() }))
vi.mock('@soundtouchjs/audio-worklet', () => ({}))

// Force bypass ToneJS
vi.mock('tone', () => ({
  start: vi.fn(),
  context: { resume: vi.fn(), state: 'running' },
  PolySynth: vi.fn(() => ({ toDestination: vi.fn(), triggerAttackRelease: vi.fn() }))
}))

describe('PlayShell', () => {
  it('mounts the PlayShell with correct document properties securely', () => {
    const defaultPayload = {
      scoreId: 'score-123',
      projectId: 'project-123',
      title: 'Wait Mode Test Score',
      artist: 'Beethoven',
      url: 'https://cdn.example.com/test.xml',
      format: 'musicxml',
    }

    render(<PlayShell payload={defaultPayload} />)
    
    // Validate the overarching structural boundary is instantiated
    expect(screen.getByText('Wait Mode Test Score')).toBeInTheDocument()
    expect(screen.getByText(/Beethoven/i)).toBeInTheDocument()
  })
})
