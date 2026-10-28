"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setLanguages } from "@/redux/features/languagesSlice";
import { HiChevronDown } from "react-icons/hi2";

const Languages = () => {
  const dispatch = useDispatch();
  const rawLanguages = useSelector((state) => state.languages?.languages || state.languages);
  const selectedLanguages = Array.isArray(rawLanguages) && rawLanguages.length > 0
    ? rawLanguages
    : ["hindi", "english"];
  const [isOpen, setIsOpen] = useState(false);

  // Sync from localStorage on initial mount if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("languages");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(setLanguages(parsed));
        }
      }
    } catch (e) {}
  }, [dispatch]);

  const languageList = [
    { id: "english", label: "English" },
    { id: "hindi", label: "Hindi" },
    { id: "punjabi", label: "Punjabi" },
    { id: "haryanvi", label: "Haryanvi" },
    { id: "rajasthani", label: "Rajasthani" },
    { id: "tamil", label: "Tamil" },
    { id: "telugu", label: "Telugu" },
    { id: "bhojpuri", label: "Bhojpuri" },
  ];

  const handleLanguageToggle = (id) => {
    let updatedLanguages;
    if (selectedLanguages.includes(id)) {
      updatedLanguages = selectedLanguages.filter((lang) => lang !== id);
    } else {
      updatedLanguages = [...selectedLanguages, id];
    }
    // Prevent empty language array; keep at least one selected
    if (updatedLanguages.length === 0) {
      updatedLanguages = [id];
    }
    dispatch(setLanguages(updatedLanguages));
    try {
      localStorage.setItem("languages", JSON.stringify(updatedLanguages));
    } catch (e) {}
  };

  return (
    <div className="py-2 border-t border-white/[0.08]">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between px-3 py-2 cursor-pointer text-gray-300 hover:text-white transition-colors select-none rounded-lg hover:bg-white/[0.04]"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Languages ({selectedLanguages.length})
        </span>
        <HiChevronDown
          className={`text-sm text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#f43f5e]" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="px-2 py-2 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
          {languageList.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.id);
            return (
              <button
                type="button"
                key={lang.id}
                onClick={() => handleLanguageToggle(lang.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                  isSelected
                    ? "bg-[#f43f5e] text-black border-[#f43f5e] font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                    : "border-white/10 text-gray-300 hover:text-white hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08]"
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Languages;
