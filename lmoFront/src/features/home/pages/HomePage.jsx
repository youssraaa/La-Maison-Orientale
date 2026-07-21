import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import HeroSection from "../components/HeroSection";
import StorySection from "../components/StorySection";
import CuisineBanner from "../components/CuisineBanner";
import SignatureMoments from "../components/SignatureMoments";
import HomeGalleryPreview from "../components/HomeGalleryPreview";
import ReviewsSection from "../components/ReviewsSection";
import LocationSection from "../components/LocationSection";
import ReserveCtaBand from "../components/ReserveCtaBand";

function HomePage() {
  return (
    <main className="home-page">
      <PublicNavbar />
      <HeroSection />
      <StorySection />
      <CuisineBanner />
      <SignatureMoments />
      <HomeGalleryPreview />
      <ReviewsSection />
      <LocationSection />
      <ReserveCtaBand />
      <SiteFooter />
    </main>
  );
}

export default HomePage;
