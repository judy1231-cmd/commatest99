// icon: material-icons 이름 (선택)
function Input({ icon, className = '', ...props }) {
  if (icon) {
    return (
      <div className="relative">
        <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">{icon}</span>
        <input
          className={`w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export default Input;
