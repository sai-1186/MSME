import React from 'react';
import { Activity } from 'lucide-react';

const VibrationAnalysis = ({ latestData }) => {
  if (!latestData) return null;

  const { vibrationX, vibrationY, vibrationZ, vibrationRMS } = latestData;
  const peak = Math.max(vibrationX, vibrationY, vibrationZ).toFixed(2);
  
  let status = "NORMAL";
  let statusColor = "text-accent-green";
  if (peak > 1.0) {
    status = "CRITICAL";
    statusColor = "text-accent-red";
  } else if (peak > 0.5) {
    status = "WARNING";
    statusColor = "text-accent-yellow";
  }

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-400 font-medium text-sm tracking-wider uppercase flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Vibration Analysis
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-900 border border-slate-700 ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
          <div className="text-slate-500 text-xs font-bold mb-1">X-AXIS</div>
          <div className="text-xl font-mono text-slate-200">{vibrationX.toFixed(2)} <span className="text-sm text-slate-500">g</span></div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
          <div className="text-slate-500 text-xs font-bold mb-1">Y-AXIS</div>
          <div className="text-xl font-mono text-slate-200">{vibrationY.toFixed(2)} <span className="text-sm text-slate-500">g</span></div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
          <div className="text-slate-500 text-xs font-bold mb-1">Z-AXIS</div>
          <div className="text-xl font-mono text-slate-200">{vibrationZ.toFixed(2)} <span className="text-sm text-slate-500">g</span></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-center bg-slate-900 rounded-lg border border-slate-700 p-4">
          <div className="text-slate-500 text-xs font-bold mb-2">RMS VIBRATION</div>
          <div className="text-3xl font-bold text-accent-blue">{vibrationRMS} <span className="text-lg text-slate-500 font-normal">g</span></div>
        </div>
        <div className="flex flex-col justify-center items-center bg-slate-900 rounded-lg border border-slate-700 p-4">
          <div className="text-slate-500 text-xs font-bold mb-2">PEAK VIBRATION</div>
          <div className="text-3xl font-bold text-slate-200">{peak} <span className="text-lg text-slate-500 font-normal">g</span></div>
        </div>
      </div>
    </div>
  );
};

export default VibrationAnalysis;
