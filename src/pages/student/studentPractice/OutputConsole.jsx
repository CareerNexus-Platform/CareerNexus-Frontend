import React from "react";

const OutputConsole = ({ executionOutput, isLightMode }) => {
  const styles = {
    headerBg: isLightMode ? 'bg-gray-100/50 border-gray-200 text-brand-700' : 'bg-white/5 border-brand-500/20 text-brand-300',
    text: isLightMode ? 'text-gray-900' : 'text-gray-300'
  };

  return (
    <div className="h-full flex flex-col bg-transparent custom-scrollbar">
      <div className={`px-4 py-3 text-sm font-semibold border-b flex items-center gap-2 ${styles.headerBg}`}>
        <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(65, 45, 32,0.8)]"></span>
        Console
      </div>
      <pre className={`flex-1 p-4 overflow-y-auto whitespace-pre-wrap text-[14px] font-mono leading-relaxed custom-scrollbar ${styles.text}`}>
        {executionOutput || "Click Run to see output..."}
      </pre>
    </div>
  );
};

export default OutputConsole;
