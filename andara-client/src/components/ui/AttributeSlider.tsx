import React from 'react';
import './AttributeSlider.css';

export interface AttributeSliderProps {
  name: string;
  abbreviation: string;
  value: number;
  description: string;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export const AttributeSlider: React.FC<AttributeSliderProps> = ({
  name,
  abbreviation,
  value,
  description,
  min = 6,
  max = 16,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  // Calculate fill percentage for the track
  const fillPercent = ((value - min) / (max - min)) * 100;

  // Generate notch values - one for each integer
  const notches = [];
  for (let i = min; i <= max; i++) {
    notches.push(i);
  }

  return (
    <div className="andara-attribute-slider">
      <div className="andara-attribute-slider__header">
        <div className="andara-attribute-slider__name">
          {name}
          <span className="andara-attribute-slider__abbr">{abbreviation}</span>
        </div>
        <div className="andara-attribute-slider__value">{value}</div>
      </div>
      <div className="andara-attribute-slider__description" title={description}>
        {description}
      </div>
      <div className="andara-attribute-slider__container" title={description}>
        <div
          className="andara-attribute-slider__track"
          style={{ width: `${fillPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="andara-attribute-slider__input"
          aria-label={`${name} attribute`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
      <div className="andara-attribute-slider__notches">
        {notches.map((notch) => (
          <span key={notch}>{notch}</span>
        ))}
      </div>
    </div>
  );
};


