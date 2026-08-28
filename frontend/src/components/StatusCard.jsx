import React from 'react';

const StatusCard = ({ title, value, unit, status, icon: Icon }) => {
  let statusColor = "text-accent-green";
  let bgGlow = "shadow-accent-green/20";
  
  if (status === "WARNING") {
    statusColor = "text-accent-yellow";
    bgGlow = "shadow-accent-yellow/20";
  } else if (status === "CRITICAL") {
    statusColor = "text-accent-red";
    bgGlow = "shadow-accent-red/20";
  } else if (status === "OFFLINE") {
    statusColor = "text-slate-500";
    bgGlow = "shadow-slate-500/10";
  }

  return (
    <div className={`bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg ${bgGlow} flex flex-col justify-between hover:bg-slate-750 transition-colors`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">{title}</h3>
        {Icon && <Icon className="text-slate-500 h-5 w-5" />}
      </div>
      
      <div className="flex items-baseline gap-2 my-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-slate-400 font-medium">{unit}</span>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        <div className={`h-2 w-2 rounded-full ${statusColor.replace('text-', 'bg-')}`}></div>
        <span className={`text-xs font-bold tracking-widest ${statusColor}`}>{status}</span>
      </div>
    </div>
  );
};

export default StatusCard;
