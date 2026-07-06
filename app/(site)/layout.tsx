import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import SmoothScroll from '@/components/common/SmoothScroll'
import PageTransition from '@/components/common/PageTransition'
import { StoreProvider } from '@/lib/store/StoreProvider'
import CartDrawer from '@/components/cart/CartDrawer'
import QuickViewModal from '@/components/products/QuickViewModal'
import { getAnnouncements } from '@/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const announcements = await getAnnouncements()
  return (
    <SmoothScroll>
      <StoreProvider>
        <Navbar announcements={announcements} />
        <main className="min-h-screen overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        {/* spacer so the footer clears the fixed mobile bottom nav */}
        <div className="h-16 lg:hidden" aria-hidden />
        <BottomNav />
        <CartDrawer />
        <QuickViewModal />
      </StoreProvider>
    </SmoothScroll>
  )
}
