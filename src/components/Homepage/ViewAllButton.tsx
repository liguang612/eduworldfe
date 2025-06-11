const ViewAllButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="text-sm font-medium text-[#1980e6] hover:text-[#1367b8] transition-colors"
  >
    Xem tất cả
  </button>
);

export default ViewAllButton;