import { useEffect, useState } from "react";
import search from "../assets/icons/search.svg";

const Search = () => {
  const [isBgLight, setIsBgLight] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 500 && window.scrollY < 2300) {
        setIsBgLight(true);
      } else {
        setIsBgLight(false);
      }
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex items-center gap-7 border-2 border-white rounded-[9999px] w-96 ml-6 mb-3">
      <img src={search} alt="Search" className="size-13 pl-6" />
      <input
        className={`text-lg ${isBgLight ? "text-[#222] placeholder:text-[#333]" : "text-[#bbb] placeholder:text-[#888]"}  focus:outline-none transition-all duration-200 ease-in-out`}
        placeholder="Search in Pigeon..."
      />
    </div>
  );
};

export default Search;
