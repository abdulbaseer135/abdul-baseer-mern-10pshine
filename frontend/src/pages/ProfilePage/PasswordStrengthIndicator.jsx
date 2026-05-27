import PropTypes from 'prop-types';

const PasswordStrengthIndicator = ({ password, strength, strengthTextColor }) => {
  if (password.length === 0) return null;

  return (
    <div className="mt-1.5 p-3 rounded-md bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={`strength-segment-${i}`}
            className={`
              h-1 flex-1 rounded-full transition-all duration-300
              ${i <= strength.score
                ? strength.color
                : 'bg-slate-200 dark:bg-slate-600'
              }
            `}
          />
        ))}
      </div>
      {strength.label && (
        <p className={`text-xs font-medium ${strengthTextColor[strength.label]}`}>
          {strength.label} password
        </p>
      )}
    </div>
  );
};

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string,
  strength: PropTypes.shape({
    score: PropTypes.number,
    label: PropTypes.string,
    color: PropTypes.string,
  }),
  strengthTextColor: PropTypes.object,
};

export default PasswordStrengthIndicator;
