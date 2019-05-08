import { css } from 'emotion'
import FeedContainer from './FeedContainer'
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

const App = () => (
  <div className={styles.main}>
    <FeedContainer />
  </div>
)

export default App
