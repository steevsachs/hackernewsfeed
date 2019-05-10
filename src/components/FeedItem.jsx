import { css } from 'emotion'
import { snakeToSpaces } from '../utils'
import PropTypes from 'prop-types'
import React from 'react'
import commonStyles from '../styles'
import cuid from 'cuid'

const styles = {
  error: css({
    color: 'rgb(250, 208, 0)',
  }),
  fetching: css({
    color: '#808080',
  }),
  row: css({
    borderLeft: '2px solid #de4c4a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 47,
    paddingLeft: '1em',
  }),
  title: css({
    fontSize: '130%',
    marginBottom: 5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}

const FeedItem = ({ data, id = cuid(), type }) => {
  const error = () => (
    <div className={css(styles.row, styles.error)} key={id}>
      Error fetching {id}
    </div>
  )
  const fetching = () => (
    <div className={css(styles.row, styles.fetching)} key={id}>
      Fetching...
    </div>
  )
  const fetchingFromHistory = () => (
    <div className={css(styles.row, styles.fetching)} key={id}>
      Fetching from history...
    </div>
  )
  const notAsked = () => (
    <div className={styles.row} key={id}>
      Preparing to fetch {id}
    </div>
  )
  const success = () => {
    const { by = 'anonymous', time, title, url } = data
    return (
      <div className={styles.row}>
        <div className={styles.title}>
          <a href={url}>{title}</a>
        </div>
        <div>
          {snakeToSpaces(by)}
          <span className={commonStyles.date}>{new Date(time * 1000).toLocaleString()}</span>
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
