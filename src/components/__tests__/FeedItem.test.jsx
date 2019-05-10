import { render } from 'react-testing-library'
import FeedItem from '../FeedItem'
import React from 'react'

describe('<FeedItem />', () => {
  it.each([
    ['error', undefined, [/Error fetching/]],
    ['fetching', undefined, ['Fetching...']],
    ['fetching-from-history', undefined, ['Fetching from history...']],
    [
      'success',
      { by: 'testing', time: 1557492511, title: 'test' },
      ['test', 'testing', new Date(1557492511 * 1000).toLocaleString()],
    ],
    [
      'success',
      { by: 'testing_byline', time: 1557492511, title: 'test' },
      ['test', 'testing byline', new Date(1557492511 * 1000).toLocaleString()],
    ],
    [
      'success',
      { time: 1557492511, title: 'test' },
      ['test', 'anonymous', new Date(1557492511 * 1000).toLocaleString()],
    ],
    ['not-yet-asked', undefined, [/Preparing to fetch/]],
  ])('renders %s', (type, data, expecteds) => {
    const { getByText } = render(<FeedItem data={data} type={type} />)
    expecteds.forEach((expected) => expect(getByText(expected)).toBeInTheDocument())
  })
})
