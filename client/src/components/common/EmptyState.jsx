const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="empty-state animate-fade-in">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
