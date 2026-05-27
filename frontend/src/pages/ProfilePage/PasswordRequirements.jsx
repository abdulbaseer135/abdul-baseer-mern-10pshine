const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

import PropTypes from 'prop-types';

const PasswordRequirements = ({ password }) => {
  if (password.length === 0) return null;

  const requirements = [
    { rule: /.{8,}/, label: '8+ characters' },
    { rule: /[A-Z]/, label: 'Uppercase letter' },
    { rule: /[a-z]/, label: 'Lowercase letter' },
    { rule: /\d/, label: 'Number' },
    { rule: /[!@#$%^&*]/, label: 'Special character' },
  ];

  return (
    <div className="mt-1.5 p-3 rounded-md bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Requirements:
      </p>
      <ul className="space-y-1.5">
        {requirements.map(({ rule, label }) => (
          <li key={label}
            className={`flex items-center gap-2 text-xs font-medium transition-colors duration-200
              ${rule.test(password)
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400'
              }`}>
            <span className="w-4 h-4 flex items-center justify-center">
              {rule.test(password) ? (
                <CheckIcon />
              ) : (
                <span className="w-1.5 h-1.5 bg-current rounded-full" />
              )}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

PasswordRequirements.propTypes = {
  password: PropTypes.string,
};

export default PasswordRequirements;
