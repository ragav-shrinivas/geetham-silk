'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

interface Props {
  src: string
  poster?: string
}

/** Premium 9:16 portrait video showcase — autoplays muted, tap to unmute. */
export default function GalleryVideo({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [hovering, setHovering] = useState(false)

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ margin: '-12% 0px -12% 0px' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="group relative w-full max-w-[330px] sm:max-w-[380px] aspect-[9/16] bg-black overflow-hidden glow-pink-soft"
      >
        {/* rose-gold frame accent */}
        <div className="absolute inset-0 z-20 pointer-events-none ring-1 ring-[var(--brand-pink)]/40" />

        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* gradient for control legibility */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

        {/* Controls */}
        <div className={`absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between transition-opacity duration-300 ${hovering || muted ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-md text-white hover:bg-white/25 transition-colors"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex items-center gap-2 px-4 h-10 bg-white/15 backdrop-blur-md text-white text-[10px] tracking-[0.2em] uppercase hover:bg-white/25 transition-colors"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {muted ? 'Tap for sound' : 'Sound on'}
          </button>
        </div>
      </motion.div>

      <p className="mt-5 text-xs tracking-[0.2em] uppercase text-gray-400">Geetham Silks · In Motion</p>
    </div>
  )
}
