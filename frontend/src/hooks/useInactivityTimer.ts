import { useEffect, useRef, useState } from 'react'

const INACTIVITY_LIMIT = 10 * 60 * 1000

const WARNING_DURATION = 30

interface UseInactivityTimerOptions {
  enabled: boolean       // false when "Remember me" is checked or user is logged out
  onTimeout: () => void  // called when the countdown reaches zero
}

export const useInactivityTimer = ({ enabled, onTimeout }: UseInactivityTimerOptions) => {
  // Is the warning modal currently visible?
  const [showWarning, setShowWarning] = useState(false)

  // Seconds remaining in the countdown
  const [secondsLeft, setSecondsLeft] = useState(WARNING_DURATION)

  // useRef stores a value that persists across renders WITHOUT causing re-renders
  // We use it for timer IDs because changing them shouldn't re-render the component
  const inactivityTimer = useRef<number | null>(null)
  const countdownTimer = useRef<number | null>(null)

  // App passes a brand new function on every render. If we listed it as a
  // dependency below, the interval would be destroyed and recreated constantly.
  const onTimeoutRef = useRef(onTimeout)
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  // Resets the inactivity countdown — called whenever the user does something
  const resetTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }

    inactivityTimer.current = window.setTimeout(() => {
      setShowWarning(true)
      setSecondsLeft(WARNING_DURATION)
    }, INACTIVITY_LIMIT)
  }

  // Called when the user clicks "Stay signed in"
  const stayActive = () => {
    setShowWarning(false)
    setSecondsLeft(WARNING_DURATION)
    resetTimer()
  }

  // Main effect — sets up activity listeners
  useEffect(() => {
    // Calling setState synchronously inside an effect triggers cascading
    // renders — App decides whether to render the modal instead.
    if (!enabled) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      return
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

    const handleActivity = () => {
      if (!showWarning) {
        resetTimer()
      }
    }

    events.forEach((event) => window.addEventListener(event, handleActivity))
    resetTimer()

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [enabled, showWarning])

  // Countdown effect — runs only while the warning is visible
  useEffect(() => {
    if (!showWarning) return

    countdownTimer.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // and read it from the ref instead of the prop
          setShowWarning(false)
          onTimeoutRef.current()
          return WARNING_DURATION
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current)
    }
  }, [showWarning])  

  return { showWarning, secondsLeft, stayActive }
}