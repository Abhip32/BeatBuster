"use client";
import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 w-full sm:min-w-[180px] px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 hover:border-[#ec4899]/60 rounded-xl text-sm font-medium text-white shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30"
      >
        <span>{selectedOption?.label}</span>
        <HiChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#ec4899]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-56 bg-[#18181f]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-1.5 z-50 animate-fadeIn">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left cursor-pointer rounded-xl mx-auto ${
                  isSelected
                    ? "text-[#ec4899] bg-[#ec4899]/15 font-bold"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <HiCheck size={16} className="text-[#ec4899] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
