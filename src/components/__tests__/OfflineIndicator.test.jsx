import { render } from 'react-testing-library'
import OfflineIndicator from '../OfflineIndicator'
import React from 'react'

beforeEach(() => {
  navigator.__defineGetter__('onLine', function() {
    return true
  })
})

afterEach(jest.resetAllMocks)

describe('<OfflineIndicator />', () => {
  it('renders offline when page is offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    })
    const { getByText } = render(<OfflineIndicator />)
    expect(getByText('Offline')).toBeInTheDocument()
  })

  it('does not render offline when page is online', () => {
    const { queryByText } = render(<OfflineIndicator />)
    expect(queryByText('Offline')).toBeNull()
  })
})
