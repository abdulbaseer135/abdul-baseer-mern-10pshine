import PropTypes from 'prop-types';

const ProfileFormTab = ({ user, loading, profileErrors, handleSubmit, onUpdateProfile, register }) => (
  <div className="
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    rounded-lg p-6 sm:p-8 shadow-sm dark:shadow-lg dark:shadow-black/20
  ">
    <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/60">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
        Edit Profile
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Update your account information
      </p>
    </div>

    <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-name" className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Full Name
        </label>
        <input
          id="profile-name"
          type="text"
          placeholder="Enter your full name"
          className={`
            w-full px-3 py-2.5 rounded-md text-sm
            bg-white dark:bg-slate-700/50
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            border transition-all duration-150
            focus:outline-none
            ${profileErrors.name
              ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/20'
              : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
            }
          `}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Minimum 2 characters' },
          })}
        />
        {profileErrors.name && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-300">
            <ErrorIcon size={12} /> {profileErrors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-email" className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Email Address
        </label>
        <div className="relative">
          <input
            id="profile-email"
            type="email"
            disabled
            className="
              w-full px-3 py-2.5 rounded-md text-sm
              bg-slate-50 dark:bg-slate-900/30
              text-slate-600 dark:text-slate-400
              border border-slate-200 dark:border-slate-700
              cursor-not-allowed
            "
            value={user?.email || ''}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Email cannot be changed. Contact support to update.
        </p>
      </div>

      <button
        type="submit"
        className="
          w-full py-2.5 px-4 rounded-md text-sm font-semibold
          bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
          dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700
          text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 mt-6
        "
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="inline animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Saving...
          </>
        ) : 'Save Changes'}
      </button>
    </form>
  </div>
);

ProfileFormTab.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
  }),
  loading: PropTypes.bool,
  profileErrors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  size: PropTypes.number,
};

const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

ErrorIcon.propTypes = {
  size: PropTypes.number,
};

export default ProfileFormTab;
