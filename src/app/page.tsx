import { Carousel } from "antd";
import Image from "next/image";
import img from "../app/assets/eae&e.jpg";
import img1 from "../app/assets/b&e.jpg";
import img2 from "../app/assets/p&e.jpg";
import img3 from "../app/assets/p&e1.jpg";
import Popular from "./component/popular/page";
import Marque from "./component/marque/page";

const contentStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  // objectFit: "cover",
};

export default function Home() {
  const images = [img, img1, img2, img3];

  return (
    <div className="w-full max-w-10/12 mx-auto">
    <div className="">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        arrows
        infinite
        dots={{ className: "custom-dots" }}
        className="rounded-2xl overflow-hidden shadow-lg"
      >
        {images.map((item, idx) => (
          <div
            key={idx}
            className="relative w-full h-[220px] sm:h-[320px] md:h-[460px] lg:h-[560px]"
          >
            <Image
              src={item}
              alt={`Slide ${idx + 1}`}
              fill
              priority={idx === 0}
              style={contentStyle}
              className="rounded-2xl"
            />
          </div>
        ))}
      </Carousel>
    </div>
    <div>
      <Popular></Popular>
    </div>
    <div>
    <Marque/>
    </div>
    </div>

  );
}
