import React from 'react';
import PropTypes from 'prop-types';

const PasswordStrengthBar = ({ passwordValue, strength }) => {
  if (passwordValue.length === 0) return null;

  const getBarColor = () => {
    if (strength.label === 'Weak') return 'var(--danger-primary)';
    if (strength.label === 'Fair') return 'var(--warning-primary)';
    if (strength.label === 'Good') return 'var(--info-primary)';
    if (strength.label === 'Strong') return 'var(--success-primary)';
    return 'var(--border-default)';
  };

  const getTextColor = () => {
    if (strength.label === 'Weak') return 'text-red-500 dark:text-red-400';
    if (strength.label === 'Fair') return 'text-yellow-500 dark:text-yellow-400';
    if (strength.label === 'Good') return 'text-blue-500 dark:text-blue-400';
    if (strength.label === 'Strong') return 'text-green-600 dark:text-green-400';
    return '';
  };

  const barColor = getBarColor();
  const textColor = getTextColor();

  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(strength.score / 5) * 100}%`,
            backgroundColor: barColor
          }}
        />
      </div>
      {strength.label && (
        <p className={`text-xs font-medium ${textColor}`}>
          Strength: <strong>{strength.label}</strong>
        </p>
      )}
    </div>
  );
};

PasswordStrengthBar.propTypes = {
  passwordValue: PropTypes.string.isRequired,
  strength: PropTypes.shape({
    score: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default PasswordStrengthBar;
