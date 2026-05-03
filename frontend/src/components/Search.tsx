import { useEffect, useState } from "react";
import search from "../assets/icons/search.svg";

const Search = () => {
  const [isBgLight, setIsBgLight] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 750 && window.scrollY < 2000) {
        setIsBgLight(true);
      } else {
        setIsBgLight(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex items-center border-2 border-white rounded-[9999px] w-122 ml-6 mb-3 bg-white/8">
      <img src={search} alt="Search" className="size-13 pl-6 cursor-pointer" />
      <input
        className={`${isBgLight ? "text-[#222] placeholder:text-[#222]" : "text-[#bbb] placeholder:text-[#aaa]"} flex-1 pl-7 pr-20 text-lg text-center focus:outline-none transition-all duration-200 ease-in-out`}
        placeholder="Search in Pigeon..."
      />
    </div>
  );
};

export default Search;
