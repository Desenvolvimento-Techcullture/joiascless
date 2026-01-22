import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import carroussel1 from '@/assets/banner1.png';
import carroussel2 from '@/assets/carrousel-aconchego2.png';
import carroussel3 from '@/assets/carrousel-aconchego3.png';

interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
}

const banners: Banner[] = [
  {
    id: "2",
    image: carroussel1,
    title: "",
    description: ""
  },
  {
    id: "3",
    image: 'https://scontent.fplu6-1.fna.fbcdn.net/v/t39.30808-6/469937808_572564202180358_1133261062752559958_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=XSK0cu45HUIQ7kNvwEhH9fl&_nc_oc=AdmnVQ5UTDjfJAQLhfQHQq4DOE0-zG2fvNfSCTxx6YvT3e-hm3q0u6_1xqoUy1CdjNlBvJcW9tuUcDKl79zDrHXB&_nc_zt=23&_nc_ht=scontent.fplu6-1.fna&_nc_gid=nffAQOBKs0Z6dnWwan9NJQ&oh=00_AfoXJyiZdosgJzGAcAiwcySbfifGoyNF68YcJFzpr0Vhng&oe=69770C8D',
    title: "",
    description: ""
  }
];

export const BannerCarousel = () => {
  return (
    <div className="w-full mb-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        {/* <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Card className="border-0 overflow-hidden">
                <div className="relative h-[300px] md:h-[400px] w-full">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/0 flex items-center">
                    <div className="container mx-auto px-8">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {banner.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 max-w-xl">
                        {banner.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent> */}
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Card className="border-0 overflow-hidden">
                {/* Contêiner com proporção 4:2 (2:1) */}
                <div className="relative w-full aspect-[3/1]">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Overlay com gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/0 flex items-center">
                    <div className="container mx-auto px-8">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {banner.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 max-w-xl">
                        {banner.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>


        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};