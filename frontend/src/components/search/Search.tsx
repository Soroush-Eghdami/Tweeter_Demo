import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SearchDropDown from "./SearchDropDown";
import { useSearch } from "../../hooks/useSearch";
import search from "../../assets/icons/search.svg";

const Search = () => {
  const [isBgLight, setIsBgLight] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const { data, isLoading } = useSearch(debouncedTerm);
  const { register, control, reset } = useForm({
    defaultValues: { search: "" },
  });
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const navigation = useNavigate();

  const searchValue = useWatch({ control, name: "search", defaultValue: "" });

  // Using for Portal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close drop down when have empty input and open when it has something inside it
  useEffect(() => {
    if (!searchValue?.trim()) {
      setIsOpen(false);
    } else if (searchValue?.trim()) {
      setIsOpen(true);
    }
  }, [searchValue]);

  // Timeout for no extra api calls
  useEffect(() => {
    const trimmed = searchValue?.trim() || "";
    const timer = setTimeout(() => {
      setDebouncedTerm(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Outside the box clicker for closing drop down
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic background and text color
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data && data.length > 0 && data[0]?.id) {
      setIsOpen(false);
      setDebouncedTerm("");
      reset();
      inputRef.current?.blur(); // removes focus from the input
      navigation(`/profile/${data[0].id}`);
    }
  };

  const handleFocus = () => {
    if (searchValue?.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <form
      ref={containerRef}
      className="relative flex items-center border-2 border-white rounded-[9999px] w-122 ml-6 mb-3 bg-white/8"
      onSubmit={handleSubmit}
    >
      <button type="submit">
        <img
          src={search}
          alt="Search"
          className="size-13 pl-6 cursor-pointer"
        />
      </button>
      <input
        {...register("search")}
        ref={(e) => {
          inputRef.current = e;
          register("search").ref(e);
        }}
        type="search"
        id="search"
        name="search"
        autoComplete="off"
        className={`${isBgLight ? "text-[#222] placeholder:text-[#222]" : "text-[#bbb] placeholder:text-[#aaa]"} flex-1 pl-11 pr-20 text-lg text-center focus:outline-none transition-all duration-200 ease-in-out [&::-webkit-search-cancel-button]:hidden`}
        placeholder="Search in Pigeon..."
        onFocus={handleFocus}
      />

      {/* Search Drop Down */}
      <SearchDropDown
        ref={dropdownRef}
        isOpen={isOpen}
        selectObj={{
          setIsOpen,
          setDebouncedTerm,
          reset,
          inputRef,
        }}
        isLoading={isLoading}
        dropdownPosition={dropdownPosition}
        data={data}
      />
    </form>
  );
};

export default Search;
