import { css } from 'emotion'
import { filter, findIndex, map, mergeDeepRight, propEq, slice } from 'ramda'
import { getDiffToNearest10, unionById, updateItemInPlace } from '../utils'
import FeedList from './FeedList'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import commonStyles from '../styles'

const styles = {
  main: css({
    height: 800,
    margin: '36px !important',
    minHeight: '800px !important',
    width: 'calc(100vw - 72px) !important',
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

const makeGetNewsItem = (dispatch) => async ({ id }) => {
  try {
    dispatch({ payload: { id }, type: 'item/FETCH' })
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    const result = await response.json()
    dispatch({ payload: { id, newsItem: result }, type: 'item/SET' })
  } catch (e) {
    dispatch({ payload: { id }, type: 'item/ERROR' })
  }
}

const makePollHackerNews = (dispatch) => async () => {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json')
    const result = await response.json()
    dispatch({ payload: result, type: 'feed/POLL_SUCCESS' })
  } catch (e) {
    dispatch({ type: 'feed/POLL_ERROR' })
  }
}

const makeGetOlderNewsItems = (dispatch) => async ({ latestId }) => {
  const getItems = async (id, found = 0) => {
    try {
      const nextId = id - 1
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${nextId}.json`)
      const result = await response.json()
      if (result.url && !result.parent) {
        dispatch({ payload: { id: nextId, newsItem: result }, type: 'item/SET' })
        if (found < 9) {
          return await getItems(nextId, found + 1)
        }
      } else {
        return await getItems(nextId, found)
      }
    } catch (e) {
      return await getItems(id - 1, found)
    }
  }
  dispatch({ type: 'feed/FETCH_OLDER' })
  await getItems(latestId)
  dispatch({ type: 'feed/FETCH_OLDER_SUCCESS' })
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
        poll: { cache: slice(0, 100, action.payload), lastUpdated: Date.now(), status: 'idle' },
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
    poll: { cache, fetchingHistory, lastPolled, lastUpdated, status: pollStatus },
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
    const itemsToGet = slice(0, 50, filter(propEq('type', 'not-yet-asked'), state.newsItems))
    map(getNewsItem, itemsToGet)
  }, [state.newsItems])

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
                  ...Array(getDiffToNearest10(newsItems.length)).fill({
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
