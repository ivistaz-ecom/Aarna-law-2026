'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

const ClarityInit = () => {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'www.aarnalaw.com'
    ) {
      Clarity.init('v8w8qq7dhr')
    }
  }, [])

  return null
}

export default ClarityInit