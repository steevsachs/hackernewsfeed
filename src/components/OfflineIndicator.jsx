import { css } from 'emotion'
import React, { useState } from 'react'

const styles = {
  main: css({
    backgroundColor: 'rgb(250, 208, 0)',
    display: 'flex',
    fontWeight: 'bold',
    justifyContent: 'center',
    padding: '10px 0',
    position: 'absolute',
    width: '100%',
  }),
}

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  window.addEventListener('offline', () => {
    setIsOffline(true)
  })
  window.addEventListener('online', () => {
    setIsOffline(false)
  })

  return isOffline ? <div className={styles.main}>Offline</div> : null
}

export default OfflineIndicator
