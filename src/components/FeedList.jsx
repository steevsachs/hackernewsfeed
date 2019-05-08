import { FixedSizeList as List } from 'react-window'
import { css } from 'emotion'
import FeedItem from './FeedItem'
import InfiniteLoader from 'react-window-infinite-loader'
import PropTypes from 'prop-types'
import React from 'react'

const styles = {
  list: css({
    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
      overflow: 'visible',
    },

    '&::-webkit-scrollbar-button': {
      display: 'none',
    },

    '&::-webkit-scrollbar-track': {
      background: '#808080',
    },

    '&::-webkit-scrollbar-thumb': {
      background: '#de4c4a',
    },

    '&::-webkit-scrollbar-thumb:vertical': {
      minHeight: 100,
    },

    '&::-webkit-scrollbar-thumb:horizontal': {
      minWidth: 100,
    },

    '&::-webkit-scrollbar-thumb:hover': {
      background: '#c53331',
    },

    '&::-webkit-scrollbar-thumb:active': {
      background: '#c53331',
      border: '1px solid #c14131',
    },
  }),
}

const FeedList = ({ fetchNewsItems, newsItems }) => {
  const isItemLoaded = (index) => !!newsItems[index]
  const loadMoreItems = () => {
    return new Promise((resolve) => {
      fetchNewsItems()
      resolve()
    })
  }

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={newsItems.length + 50}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          className={styles.list}
          height={800}
          itemCount={newsItems.length}
          itemSize={54}
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {({ index, style }) => {
            const newsItem = newsItems[index]
            return (
              <div style={style}>
                <FeedItem {...newsItem} />
              </div>
            )
          }}
        </List>
      )}
    </InfiniteLoader>
  )
}

FeedList.propTypes = {
  fetchNewsItems: PropTypes.func,
  newsItems: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.object,
      id: PropTypes.number,
      type: PropTypes.string,
    })
  ),
}

export default FeedList
