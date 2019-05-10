import * as service from '../../service/hackernews'
import { fireEvent, render, wait, waitForElement } from 'react-testing-library'
import { map, prop } from 'ramda'
import FeedContainer from '../FeedContainer'
import React from 'react'

const newsItem = {
  by: 'testy_testertron',
  id: 12345,
  time: 1557492511,
  title: 'test title',
  url: 'https://test.com',
}

const makeNewsItems = (count = 25) => {
  const items = new Array(count).fill(null)

  return items.map((item, index) => ({
    ...newsItem,
    id: index,
    title: `${newsItem.title} ${index}`,
  }))
}

describe('<FeedContainer />', () => {
  it('renders and polls for initial items', async () => {
    jest.spyOn(service, 'makeGetOlderNewsItems').mockImplementation(() => jest.fn())
    jest.spyOn(service, 'makeGetNewsItem').mockImplementation((dispatch) => async () => {
      dispatch({ payload: { id: newsItem.id, newsItem }, type: 'item/SET' })
    })
    jest.spyOn(service, 'makePollHackerNews').mockImplementation((dispatch) => async () => {
      dispatch({ payload: [newsItem.id], type: 'feed/POLL_SUCCESS' })
    })

    const { getByText } = render(<FeedContainer />)
    expect(getByText('Showing 0 stories')).toBeInTheDocument()
    await wait()
    expect(getByText('Showing 1 stories')).toBeInTheDocument()
    expect(getByText('test title')).toBeInTheDocument()
  })

  it('gets more items on scroll', async () => {
    const newsItems = makeNewsItems(50)
    const mockGetOlderNewsItems = jest.fn()
    jest.spyOn(service, 'makeGetOlderNewsItems').mockImplementation(() => mockGetOlderNewsItems)
    jest.spyOn(service, 'makeGetNewsItem').mockImplementation((dispatch) => async ({ id }) => {
      dispatch({ payload: { id, newsItem: newsItems[id] }, type: 'item/SET' })
    })
    jest.spyOn(service, 'makePollHackerNews').mockImplementation((dispatch) => async () => {
      dispatch({ payload: map(prop('id'), newsItems), type: 'feed/POLL_SUCCESS' })
    })

    const { container, getAllByText, getByText, queryByText } = render(<FeedContainer />)
    expect(getByText('Showing 0 stories')).toBeInTheDocument()
    await waitForElement(() => getByText('Showing 50 stories'))
    expect(getAllByText(/test title/).length).toEqual(16)
    expect(queryByText('test title 49')).toBeNull()
    expect(mockGetOlderNewsItems).not.toHaveBeenCalled()
    fireEvent.scroll(container.querySelector('div[style*="overflow: auto"'), {
      target: { scrollTop: 9999 },
    })
    await wait()
    expect(getByText('test title 49')).toBeInTheDocument()
    expect(mockGetOlderNewsItems).toHaveBeenCalled()
  })
})
