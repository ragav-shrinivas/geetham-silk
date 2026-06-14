import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SmoothScroll from '@/components/common/SmoothScroll'
import LoadingScreen from '@/components/common/LoadingScreen'
import PageTransition from '@/components/common/PageTransition'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <LoadingScreen />
      <Navbar />
      <main className="min-h-screen overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </SmoothScroll>
  )
}
