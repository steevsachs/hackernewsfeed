import { css } from 'emotion'
import { filter, findIndex, map, mergeDeepRight, propEq, slice } from 'ramda'
import { getDiffToNearest10, unionById, updateItemInPlace } from '../utils'
import { makeGetNewsItem, makeGetOlderNewsItems, makePollHackerNews } from '../service/hackernews'
import FeedList from './FeedList'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import commonStyles from '../styles'

const styles = {
  main: css({
    height: 800,
    margin: '36px',
    minHeight: '800px',
    width: 'calc(100vw - 72px)',
  }),
}

const updateOrAddNewsItemById = (state, item) => {
  const { id } = item
  const indexToUpdate = findIndex(propEq('id', id), state.newsItems)
  if (indexToUpdate === -1) {
    return { ...state, newsItems: [...state.newsItems, item] }
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
    fetchingHistory: false,
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
    case 'feed/FETCH_OLDER': {
      return mergeDeepRight(state, { poll: { fetchingHistory: true } })
    }
    case 'feed/FETCH_OLDER_SUCCESS': {
      return mergeDeepRight(state, { poll: { fetchingHistory: false } })
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
    poll: { cache, fetchingHistory, lastPolled, lastUpdated },
  } = state
  const cacheIsEmpty = cache.length === 0

  const getOlderNewsItems = useMemo(() => makeGetOlderNewsItems(dispatch), [dispatch])
  const getNewsItem = useMemo(() => makeGetNewsItem(dispatch), [dispatch])
  const latestId = useMemo(() => newsItems.length, [newsItems.length])
  const pollHackerNews = useMemo(() => makePollHackerNews(dispatch), [dispatch])

  const fetchItems = useCallback(() => {
    dispatch({ type: 'feed/FETCH_ITEMS' })
  }, [])

  const fetchItemsFromHistory = useCallback(() => {
    if (fetchingHistory) {
      return
    }

    const latestNewsItem = newsItems[newsItems.length - 1]
    latestNewsItem && getOlderNewsItems({ latestId: latestNewsItem.id })
  }, [fetchingHistory, getOlderNewsItems, latestId, newsItems])

  const fetchNewsItems = !cacheIsEmpty ? fetchItems : fetchItemsFromHistory

  useEffect(() => {
    dispatch({ type: 'feed/POLL' })
    pollHackerNews().then(() => {
      dispatch({ type: 'feed/FETCH_ITEMS' })
    })
  }, [])

  useEffect(() => {
    const itemsToGet = slice(0, 50, filter(propEq('type', 'not-yet-asked'), newsItems))
    map(getNewsItem, itemsToGet)
  }, [newsItems])

  return (
    <div className={styles.main}>
      <div>
        <h2>
          Hacker News Feed
          <span className={commonStyles.date}>
            Last polled: {new Date(lastPolled).toLocaleString()} |
          </span>
          <span className={commonStyles.date}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        </h2>
      </div>
      <div>
        <h2 className={commonStyles.header}>Showing {newsItems.length} stories</h2>
        <FeedList
          fetchNewsItems={fetchNewsItems}
          newsItems={
            fetchingHistory
              ? [
                  ...newsItems,
                  ...Array(getDiffToNearest10(newsItems.length) + 10).fill({
                    type: 'fetching-from-history',
                  }),
                ]
              : [...newsItems, { type: 'placeholder' }] // placeholder ensures there are always more items below
          }
        />
      </div>
    </div>
  )
}

export default FeedContainer
