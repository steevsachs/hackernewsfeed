import { css } from 'emotion'
import FeedContainer from './FeedContainer'
import OfflineIndicator from './OfflineIndicator'
import React from 'react'

const styles = {
  main: css({
    '& a': {
      '&:hover': {
        textDecoration: 'underline',
      },
      color: 'rgba(255,255,255,0.87)',
      textDecoration: 'none',
    },
    color: 'rgba(255,255,255,0.87)',
    fontFamily: '"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    overflow: 'hidden',
  }),
}

const App = () => {
  return (
    <div className={styles.main}>
      <OfflineIndicator />
      <FeedContainer />
    </div>
  )
}

export default App
