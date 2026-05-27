import PropTypes from 'prop-types';

const CameraIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

const ProfileAvatarSection = ({
  user,
  profileImage,
  handleRemoveImage,
  fileInputRef,
  handleImageUpload
}) => (
  <div className="relative z-10 mb-8 flex flex-col items-center justify-center">
    <div className="relative">
      {user?.profileImage ? (
        <div className="group relative">
          <img
            src={user.profileImage}
            alt={user?.name}
            className="
              w-32 h-32 sm:w-40 sm:h-40 rounded-full
              object-cover shadow-xl dark:shadow-2xl dark:shadow-black/50
              ring-4 ring-white dark:ring-slate-700/80
              group-hover:shadow-2xl dark:group-hover:shadow-black/60
              transition-all duration-200
            "
            onError={(e) => {
              console.error('Image failed to load:', user.profileImage);
            }}
          />
          <button
            type="button"
            aria-label="Change profile photo"
            className="
              absolute inset-0 rounded-full
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              bg-black/50 flex items-center justify-center
              cursor-pointer backdrop-blur-sm border-0 p-0
            "
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center pointer-events-none">
              <CameraIcon className="w-8 h-8 text-white mx-auto mb-1" />
              <p className="text-white text-xs font-semibold tracking-wide">Change</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="
          w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5
          bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700
          shadow-xl dark:shadow-2xl dark:shadow-black/50
          ring-4 ring-white dark:ring-slate-700/80
        ">
          <div className="
            w-full h-full rounded-full
            bg-white dark:bg-slate-700
            flex items-center justify-center
          ">
            <span className="text-5xl sm:text-6xl font-bold
              text-indigo-600 dark:text-indigo-300">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}

      <div className="absolute -bottom-2 -right-2 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={profileImage.imageLoading}
          title={user?.profileImage ? 'Change photo' : 'Upload photo'}
          className="
            flex items-center justify-center w-10 h-10
            rounded-full
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
            dark:bg-indigo-500 dark:hover:bg-indigo-600
            text-white
            shadow-lg hover:shadow-xl dark:shadow-black/40
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
            ring-white dark:ring-slate-800
          "
        >
          {profileImage.imageLoading ? (
            <SpinnerIcon className="w-5 h-5 animate-spin" />
          ) : (
            <CameraIcon className="w-5 h-5" />
          )}
        </button>

        {user?.profileImage && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={profileImage.imageLoading}
            title="Remove photo"
            className="
              flex items-center justify-center w-10 h-10
              rounded-full
              bg-red-500 hover:bg-red-600 active:bg-red-700
              dark:bg-red-600 dark:hover:bg-red-700
              text-white
              shadow-lg hover:shadow-xl dark:shadow-black/40
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500
              ring-white dark:ring-slate-800
            "
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={profileImage.imageLoading}
        className="hidden"
      />
    </div>
  </div>
);

ProfileAvatarSection.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    profileImage: PropTypes.string,
  }),
  profileImage: PropTypes.shape({
    imageLoading: PropTypes.bool,
    imageError: PropTypes.string,
    imageSuccess: PropTypes.bool,
  }).isRequired,
  handleRemoveImage: PropTypes.func.isRequired,
  fileInputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  handleImageUpload: PropTypes.func.isRequired,
};

CameraIcon.propTypes = { className: PropTypes.string };
TrashIcon.propTypes = { className: PropTypes.string };
SpinnerIcon.propTypes = { className: PropTypes.string };

export default ProfileAvatarSection;
