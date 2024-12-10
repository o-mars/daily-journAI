import React, { forwardRef } from "react";

interface InputWithButtonProps {
  value: string;
  onChange: (value: string) => void;
  onButtonClick: () => void;
  placeholder?: string;
  buttonLabel: React.ReactNode;
  readOnly?: boolean;
  shouldShowButton?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const InputWithButton = forwardRef<HTMLInputElement, InputWithButtonProps>(
  (
    {
      value,
      onChange,
      onButtonClick,
      placeholder,
      buttonLabel,
      readOnly = false,
      shouldShowButton = true,
      onKeyDown,
      disabled = false,
    },
    ref
  ) => {
    return (
      <div className="flex items-center pb-2">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`flex-grow p-2 border rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none ${readOnly ? 'opacity-50 cursor-default' : 'focus:border-blue-500'}`}
          readOnly={readOnly}
        />
        {shouldShowButton && (
          <button 
            onClick={onButtonClick} 
            disabled={disabled}
            className={`ml-2 p-2 bg-blue-500 text-white rounded ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    );
  }
);

InputWithButton.displayName = "InputWithButton";

export default InputWithButton;