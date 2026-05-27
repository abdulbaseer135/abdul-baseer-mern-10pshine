import React from 'react';
import PropTypes from 'prop-types';

const PasswordValidationRequirements = ({ password = '' }) => {
  const requirements = [
    { rule: /[a-z]/, label: 'Lowercase letter' },
    { rule: /[A-Z]/, label: 'Uppercase letter' },
    { rule: /\d/, label: 'Number' },
    { rule: /[!@#$%^&*]/, label: 'Special character (!@#$%^&*)' },
    { rule: /.{8,}/, label: 'Minimum 8 characters' },
  ];

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
        Password must contain:
      </p>
      <ul className="space-y-1">
        {requirements.map((req) => {
          const isActive = req.rule.test(password);
          return (
            <li
              key={req.label}
              className="text-xs flex items-center gap-1.5"
              style={{
                color: isActive ? 'var(--success-primary)' : 'var(--text-tertiary)'
              }}
            >
              <span className="text-lg leading-none">
                {isActive ? '✓' : '○'}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

PasswordValidationRequirements.propTypes = {
  password: PropTypes.string,
};

export default PasswordValidationRequirements;
