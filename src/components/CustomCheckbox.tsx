import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function CustomCheckbox({
  checked,
  onChange,
  ariaLabel,
}: CustomCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`w-[18px] h-[18px] rounded-[4px] inline-flex items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${
        checked
          ? 'bg-[#2563eb] border-[#2563eb] text-white'
          : 'bg-white border-[#cbd5e1] hover:border-[#2563eb]'
      }`}
    >
      {checked && <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />}
    </button>
  );
}
