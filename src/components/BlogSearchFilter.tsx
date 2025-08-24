"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogSearchFilterProps {
  availableTags?: string[];
  showStatusFilter?: boolean;
  showAuthorFilter?: boolean;
  className?: string;
}

export default function BlogSearchFilter({ 
  availableTags = [], 
  showStatusFilter = true, 
  showAuthorFilter = false,
  className = "" 
}: BlogSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );
  const [author, setAuthor] = useState(searchParams.get("author") || "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Immediate filter updates
  useEffect(() => {
    updateFilters();
  }, [status, selectedTags, author]);

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    
    // Update status
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    
    // Update tags
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }
    
    // Update author
    if (author) {
      params.set("author", author);
    } else {
      params.delete("author");
    }
    
    // Reset to page 1 when filters change
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setSelectedTags([]);
    setAuthor("");
    router.push("");
  };

  const hasActiveFilters = search || status || selectedTags.length > 0 || author;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search blogs by title, content, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Status Filter */}
        {showStatusFilter && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        )}

        {/* Author Filter */}
        {showAuthorFilter && (
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Authors</option>
            <option value="me">My Blogs</option>
          </select>
        )}
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Tags</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Search: {search}
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Status: {status}
                <button
                  onClick={() => setStatus("")}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Tag: {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                >
                  ×
                </button>
              </span>
            ))}
            {author && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                Author: {author === "me" ? "My Blogs" : author}
                <button
                  onClick={() => setAuthor("")}
                  className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
