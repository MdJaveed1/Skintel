import React from 'react';
import { SkinConcern } from '../../types';

interface SkinConcernSelectorProps {
  selectedConcerns: SkinConcern[];
  onSelect: (concern: SkinConcern) => void;
  onDeselect: (concern: SkinConcern) => void;
}

const SkinConcernSelector: React.FC<SkinConcernSelectorProps> = ({ 
  selectedConcerns, 
  onSelect, 
  onDeselect 
}) => {
  const concerns: { value: SkinConcern; label: string; description: string }[] = [
    { 
      value: 'acne', 
      label: 'Acne', 
      description: 'Breakouts, pimples, and clogged pores' 
    },
    { 
      value: 'wrinkles', 
      label: 'Fine Lines & Wrinkles', 
      description: 'Visible signs of aging and expression lines' 
    },
    { 
      value: 'dryness', 
      label: 'Dryness', 
      description: 'Flaking, tightness, and lack of moisture' 
    },
    { 
      value: 'redness', 
      label: 'Redness', 
      description: 'Inflammation, flushing, or rosacea symptoms' 
    },
    { 
      value: 'dark-spots', 
      label: 'Dark Spots', 
      description: 'Hyperpigmentation, sun damage, or post-acne marks' 
    },
    { 
      value: 'uneven-texture', 
      label: 'Uneven Texture', 
      description: 'Rough patches, bumps, or inconsistent skin feel' 
    },
    { 
      value: 'oiliness', 
      label: 'Oiliness', 
      description: 'Excess sebum production and shiny appearance' 
    },
    { 
      value: 'large-pores', 
      label: 'Large Pores', 
      description: 'Visibly enlarged pores, typically on nose and cheeks' 
    },
    { 
      value: 'under-eye-circles', 
      label: 'Under-Eye Circles', 
      description: 'Darkness or puffiness around the eye area' 
    },
    { 
      value: 'sensitivity', 
      label: 'Sensitivity', 
      description: 'Reactive skin that gets irritated easily' 
    }
  ];

  const handleToggle = (concern: SkinConcern) => {
    if (selectedConcerns.includes(concern)) {
      onDeselect(concern);
    } else {
      onSelect(concern);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select your skin concerns</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Choose all that apply to help us provide accurate recommendations.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {concerns.map((concern) => (
          <div 
            key={concern.value}
            onClick={() => handleToggle(concern.value)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedConcerns.includes(concern.value)
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700'
            }`}
          >
            <h4 className={`font-medium ${
              selectedConcerns.includes(concern.value)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-900 dark:text-white'
            }`}>
              {concern.label}
            </h4>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {concern.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkinConcernSelector;