import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import SmoothScroll from '@/components/common/SmoothScroll'
import LoadingScreen from '@/components/common/LoadingScreen'
import PageTransition from '@/components/common/PageTransition'
import { StoreProvider } from '@/lib/store/StoreProvider'
import CartDrawer from '@/components/cart/CartDrawer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <StoreProvider>
        <LoadingScreen />
        <Navbar />
        <main className="min-h-screen overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        {/* spacer so the footer clears the fixed mobile bottom nav */}
        <div className="h-16 lg:hidden" aria-hidden />
        <BottomNav />
        <CartDrawer />
      </StoreProvider>
    </SmoothScroll>
  )
}
