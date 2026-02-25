import { useEffect } from 'react';

// type: 'success' | 'error' | 'info'
function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-primary text-white',
    error:   'bg-red-500 text-white',
    info:    'bg-slate-700 text-white',
  };

  const icons = {
    success: 'check_circle',
    error:   'error',
    info:    'info',
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
      <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold ${styles[type]}`}>
        <span className="material-icons text-lg">{icons[type]}</span>
        {message}
      </div>
    </div>
  );
}

export default Toast;
