import { snakeToSpaces } from '../utils'
import PropTypes from 'prop-types'
import React from 'react'
import cuid from 'cuid'

const FeedItem = ({ data, id = cuid(), type }) => {
  const error = () => <div key={id}>Error fetching {id}</div>
  const fetching = () => <div key={id}>Fetching...</div>
  const fetchingFromHistory = () => <div key={id}>Fetching from history...</div>
  const notAsked = () => <div key={id}>Preparing to fetch {id}</div>
  const success = () => {
    const { by = 'anonymous', time, title, url } = data
    return (
      <div>
        <div>{snakeToSpaces(by)}</div>
        <div>{new Date(time).toLocaleString()}</div>
        <div>
          <a href={url}>{title}</a>
        </div>
      </div>
    )
  }

  switch (type) {
    case 'error': {
      return error()
    }
    case 'fetching': {
      return fetching()
    }
    case 'fetching-from-history': {
      return fetchingFromHistory()
    }
    case 'success': {
      return data ? success() : fetching()
    }
    case 'not-yet-asked':
    default:
      return notAsked()
  }
}

FeedItem.propTypes = {
  data: PropTypes.shape({
    by: PropTypes.string,
    time: PropTypes.number,
    title: PropTypes.string,
    url: PropTypes.string,
  }),
  id: PropTypes.number,
}

export default FeedItem
