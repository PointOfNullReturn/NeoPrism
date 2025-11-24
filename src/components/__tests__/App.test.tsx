import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from '@/app/App'

describe('App', () => {
  it('renders default headline', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { name: /SwankyPaint \(MVP\)/i })
    expect(heading).toBeInTheDocument()
  })
})
