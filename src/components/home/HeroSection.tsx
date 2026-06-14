import { getHeroSlides } from '@/lib/queries'
import HeroSlider from './HeroSlider'

export default async function HeroSection({ durationMs }: { durationMs?: number }) {
  const slides = await getHeroSlides()
  return <HeroSlider slides={slides} durationMs={durationMs} />
}
