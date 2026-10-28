import { useCallback, useRef, useState } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

// Promise-based confirmation dialog, replacing window.confirm().
// Usage: const { confirm, ConfirmDialog } = useConfirm();
//        if (!(await confirm('Delete this item?'))) return;
//        return <>{ConfirmDialog}...</>
export const useConfirm = () => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((message, title = 'Please confirm') => {
    setState({ message, title });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handle = (result) => {
    setState(null);
    resolver.current?.(result);
  };

  const ConfirmDialog = state ? (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-900/40 border border-amber-800/50 flex items-center justify-center flex-shrink-0">
            <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">{state.title}</h3>
            <p className="text-slate-400 text-sm mt-1">{state.message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => handle(false)} className="btn-outline">Cancel</button>
          <button onClick={() => handle(true)} className="btn-danger">Confirm</button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
};
