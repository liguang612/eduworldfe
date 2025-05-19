import React, { useState, useEffect, useCallback } from 'react';

interface SearchResultItem {
  id: string;
  [key: string]: any; // Cho phép các thuộc tính khác
}

interface SearchableDialogMultiProps<T extends SearchResultItem> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  onSearch: (searchTerm: string) => Promise<T[]> | T[];
  renderItem: (item: T, selected: boolean, onToggle: (item: T) => void) => React.ReactNode;
  onItemsSelected: (items: T[]) => void;
  itemContainerClassName?: string;
  loadingText?: string;
  noResultsText?: string;
  confirmButtonText?: string;
  renderPreview?: (item: T) => React.ReactNode;
}

export function SearchableDialogMulti<T extends SearchResultItem>({
  isOpen,
  onClose,
  title,
  searchPlaceholder,
  onSearch,
  renderItem,
  onItemsSelected,
  itemContainerClassName = "flex flex-col gap-2 p-4 overflow-y-auto max-h-[60vh]",
  loadingText = "Đang tìm kiếm...",
  noResultsText = "Không tìm thấy kết quả nào.",
  confirmButtonText = "Thêm các câu hỏi đã chọn"
}: SearchableDialogMultiProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await Promise.resolve(onSearch(term));
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(searchTerm);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Reset state khi mở dialog
      setSearchTerm('');
      setSearchResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setSelectedItems([]);
    } else {
      document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleToggleItem = (item: T) => {
    setSelectedItems((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleConfirm = () => {
    onItemsSelected(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Lớp phủ mờ */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 md:mx-auto flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold text-[#0e141b]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-4">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-12 bg-[#e7edf3]">
            <div
              className="text-[#4e7397] flex items-center justify-center pl-4 rounded-l-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleInputChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] h-full placeholder:text-[#4e7397] px-3 text-base font-normal leading-normal"
            />
          </div>
        </form>

        {(hasSearched || isLoading) && <div className={itemContainerClassName}>
          {isLoading && <p className="text-gray-500 col-span-full text-center py-4">{loadingText}</p>}
          {!isLoading && hasSearched && searchResults.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">{noResultsText}</p>
          )}
          {!isLoading && searchResults.map((item) => (
            renderItem(item, !!selectedItems.find(i => i.id === item.id), handleToggleItem)
          ))}
        </div>}

        <div className="p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={selectedItems.length === 0}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 