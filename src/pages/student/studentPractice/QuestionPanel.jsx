import React from "react";

const QuestionPanel = ({ question, isLightMode }) => {
  if (!question) return <div className="p-6 text-gray-500">No question data available.</div>;

  const styles = {
    titleText: isLightMode ? 'text-gray-900' : 'text-white',
    containerText: isLightMode ? 'text-gray-800' : 'text-paper',
    sectionTitle: isLightMode ? 'text-brand-700 border-gray-200' : 'text-brand-300 border-brand-500/20',
    bodyText: isLightMode ? 'text-gray-700' : 'text-gray-300',
    constraintBg: isLightMode ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-400',
    tcBg: isLightMode ? 'bg-gray-50 border-gray-200 hover:border-brand-300' : 'bg-white/5 border-white/5 hover:border-brand-500/30',
    tcInnerBg: isLightMode ? 'bg-white border-gray-200 text-gray-800' : 'bg-black/40 border-white/5 text-gray-300',
    tcOutputBg: isLightMode ? 'bg-white border-gray-200 text-brand-700' : 'bg-black/40 border-white/5 text-brand-300/90',
    badge: isLightMode ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-brand-500/10 text-brand-300 border-brand-500/20',
    tcLabelInput: isLightMode ? 'text-brand-600' : 'text-brand-400/80',
    tcLabelOutput: isLightMode ? 'text-brand-600' : 'text-brand-400/80',
  };

  return (
    <div className={`h-full overflow-y-auto bg-transparent p-6 min-h-0 custom-scrollbar relative ${styles.containerText}`}>
      <div className="mb-8">
        <h2 className={`text-3xl font-extrabold mb-3 tracking-tight ${styles.titleText}`}>{question.title}</h2>
        <div className="flex gap-4 text-sm font-medium">
          <span className={`px-3 py-1.5 border rounded-lg shadow-sm backdrop-blur-sm ${styles.badge}`}>
            Points: {question.points}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${styles.sectionTitle}`}>Description</h3>
        <div className={`whitespace-pre-wrap leading-relaxed text-[15px] ${styles.bodyText}`}>
          {question.description}
        </div>
      </div>

      {question.constraints && (
        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${styles.sectionTitle}`}>Constraints</h3>
          <div className={`whitespace-pre-wrap leading-relaxed text-[15px] font-mono p-4 rounded-xl border ${styles.constraintBg}`}>
            {question.constraints}
          </div>
        </div>
      )}

      {question.publicTestCases && question.publicTestCases.length > 0 && (
        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${styles.sectionTitle}`}>Example Test Cases</h3>
          <div className="space-y-4">
            {question.publicTestCases.map((tc, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border transition-colors duration-300 ${styles.tcBg}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className={`text-sm font-semibold block mb-2 ${styles.tcLabelInput}`}>Input</span>
                    <pre className={`text-sm p-3 rounded-xl border overflow-x-auto custom-scrollbar ${styles.tcInnerBg}`}>{tc.input || "(Empty)"}</pre>
                  </div>
                  <div>
                    <span className={`text-sm font-semibold block mb-2 ${styles.tcLabelOutput}`}>Expected Output</span>
                    <pre className={`text-sm p-3 rounded-xl border overflow-x-auto custom-scrollbar ${styles.tcOutputBg}`}>{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
