import { FixedSizeList as List } from 'react-window'
import FeedItem from './FeedItem'
import InfiniteLoader from 'react-window-infinite-loader'
import PropTypes from 'prop-types'
import React from 'react'

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
      itemCount={newsItems.length + 10}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          height={600}
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
