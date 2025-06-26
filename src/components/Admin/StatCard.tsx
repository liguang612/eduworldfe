const StatCard = ({ title, value, icon, /* change, changeType, */ onClick }: { title: string, value: string, icon: React.ReactNode, /* change: string, changeType: 'increase' | 'decrease', */ onClick: () => void }) => (
  <div className="bg-white p-6 rounded-xl border border-[#d0dbe7] cursor-pointer hover:bg-slate-100 transition-all" onClick={() => onClick()}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-[#4e7397]">{title}</p>
        <p className="text-2xl font-bold text-[#0e141b] mt-1">{value}</p>
      </div>
      <div className="bg-[#e7f3ff] text-[#1980e6] rounded-full p-2">
        {icon}
      </div>
    </div>
    {/* <p className={`text-xs mt-2 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
      {change} so với tháng trước
    </p> */}
  </div>
);

export default StatCard;