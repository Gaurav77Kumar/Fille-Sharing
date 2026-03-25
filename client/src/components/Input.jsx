import React from "react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
}) => {
  return (
    <div className="mb-4 group">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5 transition-colors duration-200 group-focus-within:text-blue-600"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50/50 backdrop-blur-sm ${
          error
            ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30"
            : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
        } focus:outline-none focus:ring-4 transition-all duration-300 ease-out disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400 hover:border-gray-300 hover:bg-white`}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
