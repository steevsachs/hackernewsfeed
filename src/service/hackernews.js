const makeGetNewsItem = (dispatch) => async ({ id }) => {
  try {
    dispatch({ payload: { id }, type: 'item/FETCH' })
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    const result = await response.json()
    if (result === null) {
      throw new Error()
    }

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
        if (found < 19) {
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

export { makeGetNewsItem, makeGetOlderNewsItems, makePollHackerNews }
