import { snakeToSpaces } from '../utils'
import PropTypes from 'prop-types'
import React from 'react'

const FeedItem = ({ data = {}, id }) => {
  const { by, time, title, url } = data
  return (
    <React.Fragment>
      <div>{snakeToSpaces(by)}</div>
      <div>{new Date(time).toLocaleString()}</div>
      <div>
        <a href={url}>{title}</a>
      </div>
    </React.Fragment>
  )
}

FeedItem.propTypes = {
  data: PropTypes.shape({
    by: PropTypes.string,
    time: PropTypes.number,
    title: PropTypes.string,
    url: PropTypes.string,
  }),
  id: PropTypes.number.isRequired,
}

export default FeedItem
