import { useRef, useEffect } from 'react'

export function useTilt() {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const onMove = (e) => {
      const img = card.querySelector('.tilt-image')
      if (!img) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotX = (y - cy) / 20
      const rotY = (cx - x) / 20
      img.style.transform = `scale(1.08) rotateX(${rotX}deg) rotateY(${rotY}deg)`
      img.style.filter = 'sepia(0) contrast(1.1)'
    }
    const onLeave = () => {
      const img = card.querySelector('.tilt-image')
      if (img) {
        img.style.transform = ''
        img.style.filter = ''
      }
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return cardRef
}
