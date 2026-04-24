const NoteSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-4/6 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="flex gap-2">
        <div className="h-7 w-14 bg-gray-200 rounded" />
        <div className="h-7 w-14 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const NoteSkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <NoteSkeleton key={i} />
    ))}
  </div>
);

export default NoteSkeleton;