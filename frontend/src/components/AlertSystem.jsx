import React from 'react';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

const AlertSystem = ({ alerts }) => {
  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase">
          Real-Time Alerts
        </h3>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded font-medium">
          {alerts.length} Total
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-slate-500 text-sm italic text-center mt-10">No active alerts</div>
        ) : (
          alerts.map((alert, index) => {
            let Icon = Info;
            let bgColor = "bg-slate-700/20";
            let borderColor = "border-slate-700";
            let textColor = "text-slate-300";
            let iconColor = "text-slate-400";

            if (alert.severity === "WARNING") {
              Icon = AlertTriangle;
              bgColor = "bg-accent-yellow/10";
              borderColor = "border-accent-yellow/30";
              textColor = "text-accent-yellow";
              iconColor = "text-accent-yellow";
            } else if (alert.severity === "CRITICAL") {
              Icon = AlertCircle;
              bgColor = "bg-accent-red/10";
              borderColor = "border-accent-red/30";
              textColor = "text-accent-red";
              iconColor = "text-accent-red";
            } else if (alert.severity === "INFO") {
              bgColor = "bg-accent-blue/10";
              borderColor = "border-accent-blue/30";
              textColor = "text-accent-blue";
              iconColor = "text-accent-blue";
            }

            return (
              <div key={index} className={`p-3 rounded-lg border ${borderColor} ${bgColor} flex gap-3 items-start`}>
                <Icon className={`h-5 w-5 mt-0.5 ${iconColor} shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${textColor}`}>{alert.severity}</span>
                    <span className="text-slate-500 text-[10px]">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-slate-200">{alert.message}</div>
                  {alert.value !== undefined && (
                    <div className="text-xs text-slate-400 mt-1">
                      {alert.parameter}: <span className="font-mono text-slate-300">{alert.value}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertSystem;
