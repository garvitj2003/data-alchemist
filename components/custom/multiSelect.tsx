"use client";

import { useState, useEffect } from "react";

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  useEffect(() => {
    const closeOnOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".multi-select")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="relative w-full multi-select">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border rounded-md shadow-sm"
      >
        {value.length > 0
          ? value.join(", ")
          : <span className="text-gray-400">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-md max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-2"
            >
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={value.includes(opt.value)}
                onChange={() => toggleValue(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
