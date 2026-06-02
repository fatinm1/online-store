import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ref = useRef(null)

  useEffect(() => {
    const cursor = ref.current
    if (!cursor) return

    const onMove = (e) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    // Use event delegation so dynamically rendered buttons/links are covered
    const onOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        cursor.style.transform = 'translate(-50%, -50%) scale(4)'
      }
    }
    const onOut = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)'
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return <div ref={ref} className="custom-cursor" aria-hidden="true" />
}
