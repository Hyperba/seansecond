import Hero from "@/components/sections/Hero/Hero";

import BrandsCarousel from "@/components/sections/BrandsCarousel/BrandsCarousel";

import Experience from "@/components/sections/Experience/Experience";

import Podcast from "@/components/sections/Podcast/Podcast";

import MeetSean from "@/components/sections/MeetSean/MeetSean";

import Testimonials from "@/components/sections/Testimonials/Testimonials";
import GalleryMosaic from "@/components/sections/GalleryMosaic/GalleryMosaic";
import AreYouFitCta from "@/components/sections/AreYouFitCta/AreYouFitCta";
import QuickMessage from "@/components/sections/QuickMessage/QuickMessage";

export default function Home() {
  return (
    <main>
      <Hero />
      <BrandsCarousel />
      <section id="experience">
        <Experience />
      </section>
      <section id="podcast">
        <Podcast />
      </section>
      <MeetSean />
      <section id="testimonials">
        <Testimonials />
      </section>
      <section id="gallery">
        <GalleryMosaic />
      </section>
      <AreYouFitCta />
      <QuickMessage />
    </main>
  );
}
