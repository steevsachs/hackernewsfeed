import { filter, findIndex, map, mergeDeepRight, mergeDeepWith, propEq, slice } from 'ramda'
import { unionById, updateItemInPlace } from '../utils'
import FeedList from './FeedList'
import React, { useCallback, useEffect, useReducer } from 'react'

const updateOrAddNewsItemById = (state, item) => {
  const { id } = item
  const indexToUpdate = findIndex(propEq('id', id), state.newsItems)
  if (indexToUpdate === undefined) {
    return mergeDeepWith(unionById, state, { newsItems: [item] })
  }

  return {
    ...state,
    newsItems: updateItemInPlace(state.newsItems, indexToUpdate, item),
  }
}

const initialState = {
  newsItems: [],
  poll: {
    cache: [],
    lastPolled: null,
    lastUpdated: null,
    status: 'idle',
  },
}

const transformToNewsItem = (id) => ({
  id,
  type: 'not-yet-asked',
})

const reducer = (state, action) => {
  switch (action.type) {
    case 'feed/FETCH_ITEMS': {
      const { count = 25 } = action.payload || {}
      const itemsToFetch = slice(0, count, state.poll.cache)
      const newCache = slice(count, state.poll.cache.length, state.poll.cache)
      return {
        ...state,
        newsItems: unionById(state.newsItems, map(transformToNewsItem, itemsToFetch)),
        poll: { ...state.poll, cache: newCache },
      }
    }
    case 'feed/POLL': {
      return mergeDeepRight(state, {
        poll: { lastPolled: Date.now(), status: 'polling' },
      })
    }
    case 'feed/POLL_ERROR': {
      return mergeDeepRight(state, {
        poll: { status: 'error' },
      })
    }
    case 'feed/POLL_SUCCESS': {
      return mergeDeepRight(state, {
        poll: { cache: action.payload, lastUpdated: Date.now(), status: 'idle' },
      })
    }
    case 'item/ERROR': {
      const { id } = action.payload
      const updated = { id, type: 'error' }
      return updateOrAddNewsItemById(state, updated)
    }
    case 'item/FETCH': {
      const { id } = action.payload
      const updated = { id, type: 'fetching' }
      return updateOrAddNewsItemById(state, updated)
    }
    case 'item/SET': {
      const { id, newsItem } = action.payload
      const updated = { data: newsItem, id, type: 'success' }
      return updateOrAddNewsItemById(state, updated)
    }
    default:
      return state
  }
}

const FeedContainer = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    newsItems,
    poll: { cache, lastPolled, lastUpdated, status: pollStatus },
  } = state
  const cacheIsEmpty = cache.length === 0

  const getNewsItem = async ({ id }) => {
    try {
      dispatch({ payload: { id }, type: 'item/FETCH' })
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      const result = await response.json()
      dispatch({ payload: { id, newsItem: result }, type: 'item/SET' })
    } catch (e) {
      dispatch({ payload: { id }, type: 'item/ERROR' })
    }
  }

  const pollHackerNews = async () => {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json')
      const result = await response.json()
      dispatch({ payload: result, type: 'feed/POLL_SUCCESS' })
    } catch (e) {
      dispatch({ type: 'feed/POLL_ERROR' })
    }
  }

  const fetchNewsItems = useCallback(() => {
    if (!cacheIsEmpty) {
      dispatch({ type: 'feed/FETCH_ITEMS' })
    }
  }, [cacheIsEmpty])

  useEffect(() => {
    dispatch({ type: 'feed/POLL' })
    pollHackerNews().then(() => {
      dispatch({ type: 'feed/FETCH_ITEMS' })
    })
  }, [])

  useEffect(() => {
    const itemsToGet = slice(0, 50, filter(propEq('type', 'not-yet-asked'), state.newsItems))
    map(getNewsItem, itemsToGet)
  }, [state.newsItems])

  return (
    <div>
      <div>Poll Status: {pollStatus}</div>
      <div>
        Showing {newsItems.length} out of {cache.length} items
      </div>
      <div>Last polled: {new Date(lastPolled).toLocaleString()}</div>
      <div>Last updated: {new Date(lastUpdated).toLocaleString()}</div>
      <div>
        <FeedList fetchNewsItems={fetchNewsItems} newsItems={newsItems} />
      </div>
    </div>
  )
}

export default FeedContainer
