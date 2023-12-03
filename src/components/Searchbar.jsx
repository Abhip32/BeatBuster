'use client'
import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setIsTyping } from '@/redux/features/loadingBarSlice';


const Searchbar = () => {
  const ref = React.useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    if (searchTerm === '') {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    router.push(`/search/${searchTerm}`);
  };
  const handleFocus = () => {
    dispatch(setIsTyping(true));
  };
  const handleBlur = () => {
    dispatch(setIsTyping(false));
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="p-2 text-zinc-400 relative focus-within:text-zinc-600">
      <label htmlFor="search-field" className="sr-only">
        Search all files
      </label>
      <div className="flex flex-row justify-start items-center bg-white rounded-full mt-2">
        <FiSearch aria-hidden="true" className="w-5 h-5 ml-4 text-zinc-800" />
        <input
        onFocus={handleFocus}
        onBlur={handleBlur}
          name="search-field"
          autoComplete="off"
          id="search-field"
          className="flex-1 bg-transparent w-32 lg:w-64 placeholder-zinc-800 outline-none text-base text-zinc p-2 "
          placeholder="Search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </form>
  );
};

export default Searchbar;