function AdminHeader({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#221610]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
      <div className="px-6 h-16 flex items-center justify-between">
        <div>
          {title && <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {children}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 relative">
            <span className="material-icons-round">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="h-8 w-px bg-gray-200 dark:bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">관리자 김쉼표</p>
              <p className="text-[10px] text-gray-500">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-icons-round">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
