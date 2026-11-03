import { apiErrorMessage } from "../../services/apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarRecruiterDashboard from "../../components/NavbarRecruiterDashboard";
import { FaClock, FaFileUpload, FaClipboardList, FaArrowLeft, FaCheckCircle, FaPlus, FaTrash } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import requestApi from "../../services/request";
import getuserId from "../../services/getUserId";
import toast from "react-hot-toast";

const RecruitmentProcessPage = () => {
  const [selectedRound, setSelectedRound] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = getuserId();
  const [min_marks, setmin_marks] = useState(0);

  // Coding round configuration (problem + test cases)
  const [codingAssessmentName, setCodingAssessmentName] = useState("");
  const [codingQuestions, setCodingQuestions] = useState([
    {
      title: "",
      description: "",
      constraints: "",
      points: 10,
      testCases: [{ input: "", expectedOutput: "", isHidden: false, marks: 5 }],
    },
  ]);

  const { jobId } = useParams();
  const navigate = useNavigate();

  const [configuredRounds, setConfiguredRounds] = useState([]);
  const [roundsVersion, setRoundsVersion] = useState(0);
  const [loadingRounds, setLoadingRounds] = useState(false);



  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.", { id: "pdf-warning" });
      e.target.value = ''; // Clear the input
      if (type === "question") setQuestionFile(null);

      return;
    }
    if (file && file.size > 5 * 1024 * 1024) { // Max 5MB file size example
      toast.error("File size exceeds 5MB limit.", { id: "size-warning" });
      e.target.value = ''; // Clear the input
      if (type === "question") setQuestionFile(null);

      return;
    }

    if (type === "question") setQuestionFile(file);

  };

  const handleSubmit = async () => { // <--- Make handleSubmit async
    if (!selectedRound || !startTime || !endTime || !jobId) {
      toast.error("Please fill in all required fields and ensure job ID is available.", { id: "missing-fields" });
      return;
    }

    setLoading(true);

    try {
      // Aptitude Round -> classic MCQ PDF-based assessment
      if (selectedRound === "Aptitude Round") {
        if (!questionFile || !min_marks) {
          toast.error("Please upload the aptitude MCQ PDF and set minimum marks.", { id: "missing-aptitude-fields" });
          setLoading(false);
          return;
        }

        const formData = new FormData();

        const roundDetails = {
          createdByUserId: userId,
          jobPostId: jobId,
          roundName: selectedRound,
          startTime: startTime,
          endTime: endTime,
          min_marks: min_marks,
        };

        formData.append("roundDetails", new Blob([JSON.stringify(roundDetails)], { type: "application/json" }));
        formData.append("questionPdf", questionFile);

        const response = await requestApi.post(
          `exam/recruiter/mcq/assessment`,
          formData
        );

        toast.success("Aptitude round configured successfully!", { id: "round-success" });
        console.log("API Response:", response.data);
      }

      // Coding Round -> coding problem + test cases, treated as elimination round
      if (selectedRound === "Coding Round") {
        if (!codingAssessmentName || !min_marks) {
          toast.error("Please provide coding round name and minimum marks.", { id: "missing-coding-fields" });
          setLoading(false);
          return;
        }

        const payload = {
          assessmentName: codingAssessmentName,
          jobPostId: parseInt(jobId),
          startTime: startTime,
          endTime: endTime,
          questions: codingQuestions,
          mode: "ELIMINATION",
          minMarks: min_marks,
        };

        const response = await requestApi.post("/coding-exam/tpo/create", payload);
        toast.success("Coding elimination round configured successfully!", { id: "coding-round-success" });
        console.log("Coding round API Response:", response.data);
      }

      setRoundsVersion((version) => version + 1);
      // Reset common state
      setSelectedRound("");
      setStartTime("");
      setEndTime("");
      setQuestionFile(null);
      setCodingAssessmentName("");
      setCodingQuestions([
        {
          title: "",
          description: "",
          constraints: "",
          points: 10,
          testCases: [{ input: "", expectedOutput: "", isHidden: false, marks: 5 }],
        },
      ]);

    } catch (error) {
      console.error("Error configuring round:", error);
      toast.error("Failed to configure recruitment round: " + apiErrorMessage(error), { id: "round-error" });
    } finally {
      setLoading(false);
    }
  };

  // Coding round question handlers
  const handleCodingQuestionChange = (qIndex, field, value) => {
    const updated = [...codingQuestions];
    updated[qIndex][field] = value;
    setCodingQuestions(updated);
  };

  const handleAddCodingQuestion = () => {
    setCodingQuestions([
      ...codingQuestions,
      {
        title: "",
        description: "",
        constraints: "",
        points: 10,
        testCases: [{ input: "", expectedOutput: "", isHidden: false, marks: 5 }],
      },
    ]);
  };

  const handleRemoveCodingQuestion = (qIndex) => {
    const updated = codingQuestions.filter((_, i) => i !== qIndex);
    setCodingQuestions(updated);
  };

  const handleAddCodingTestCase = (qIndex) => {
    const updated = [...codingQuestions];
    updated[qIndex].testCases.push({ input: "", expectedOutput: "", isHidden: false, marks: 5 });
    setCodingQuestions(updated);
  };

  const handleRemoveCodingTestCase = (qIndex, tcIndex) => {
    const updated = [...codingQuestions];
    updated[qIndex].testCases = updated[qIndex].testCases.filter((_, i) => i !== tcIndex);
    setCodingQuestions(updated);
  };

  const handleCodingTestCaseChange = (qIndex, tcIndex, field, value) => {
    const updated = [...codingQuestions];
    updated[qIndex].testCases[tcIndex][field] = value;
    setCodingQuestions(updated);
  };

  const handleBack = () => {
    navigate(`/recruiter/${userId}/applications`);
  };


  useEffect(() => {
    const fetchConfiguredRounds = async () => {
      try {
        setLoadingRounds(true);

        const response = await requestApi.get(
          `/exam/recruiter/${jobId}`
        );

        setConfiguredRounds(response.data || []);
      } catch (error) {
        console.error("Error fetching configured rounds:", error);
      } finally {
        setLoadingRounds(false);
      }
    };

    if (userId && jobId) {
      fetchConfiguredRounds();
    }
  }, [userId, jobId, roundsVersion]);

  return (
    <>
      <NavbarRecruiterDashboard />

      {/* Back Button */}
      <div className="pt-20 px-6">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-brand-300 rounded-full text-gray-500 hover:text-brand-600 shadow-sm hover:shadow transition-all duration-300 mb-6 font-medium text-sm w-fit"
        >
          <FaArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Applications
        </button>
      </div>

      <div className="cn-data-page px-6 pb-16 bg-white min-h-screen font-poppins text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-brand-700 text-center">Recruitment Process</h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Round Selection */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-brand-50 p-6 rounded-xl shadow-md"
          >
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3 gap-2">
              <FaClipboardList className="text-brand-600" />
              Select Recruitment Round
            </label>
            <select aria-label="Select Recruitment Round"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Round --</option>
              <option value="Aptitude Round">Aptitude Round</option> {/* <--- Change value to match backend enum/string */}
              <option value="Coding Round">Coding Round</option> {/* <--- Change value */}
            </select>

            {/* Contextual help text based on selected round */}
            {selectedRound === "Aptitude Round" && (
              <p className="mt-3 text-xs text-gray-600">
                Configure an aptitude MCQ round for this job. Upload the MCQ question PDF and set the minimum marks to qualify.
              </p>
            )}
            {selectedRound === "Coding Round" && (
              <p className="mt-3 text-xs text-gray-600">
                Configure a coding MCQ elimination round for this job. Upload coding-related MCQ questions as a PDF and set the minimum marks.
                Students who do not meet the minimum marks in this round will be automatically rejected for this job.
              </p>
            )}
          </Motion.div>

          {/* Center: Start and End Time */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-brand-50 p-6 rounded-xl shadow-md"
          >
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-2">
                  <FaClock className="text-brand-600" />
                  Start Time
                </label>
                <input aria-label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-2">
                  <FaClock className="text-brand-600" />
                  End Time
                </label>
                <input aria-label="End Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </Motion.div>

          {/* Right: Configuration panel (MCQ or Coding based on selection) */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-brand-50 p-6 rounded-xl shadow-md"
          >
            <div className="space-y-4">
              {/* MCQ Aptitude configuration */}
              {selectedRound === "Aptitude Round" && (
                <>
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-2">
                      <FaFileUpload className="text-brand-600" />
                      Upload Aptitude Questions (PDF)
                    </label>
                    <input aria-label="Upload Aptitude Questions (PDF)"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "question")}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                    />
                    {questionFile && (
                      <p className="text-brand-600 text-sm mt-1">{questionFile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-2">
                      <FaCheckCircle className="text-brand-600" />
                      Minimum Marks
                    </label>
                    <input aria-label="Enter minimum marks"
                      type="number"
                      min="0"
                      value={min_marks || ""}
                      onChange={(e) => setmin_marks(Number(e.target.value))}
                      placeholder="Enter minimum marks"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              )}

              {/* Coding Round configuration: problem + test cases */}
              {selectedRound === "Coding Round" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Coding Round Name</label>
                    <input aria-label="e.g. Coding Round - DSA"
                      type="text"
                      value={codingAssessmentName}
                      onChange={(e) => setCodingAssessmentName(e.target.value)}
                      placeholder="e.g. Coding Round - DSA"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-2">
                      <FaCheckCircle className="text-brand-600" />
                      Minimum Marks (Elimination Threshold)
                    </label>
                    <input aria-label="Enter minimum marks for coding round"
                      type="number"
                      min="0"
                      value={min_marks || ""}
                      onChange={(e) => setmin_marks(Number(e.target.value))}
                      placeholder="Enter minimum marks for coding round"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4 space-y-4 max-h-96 overflow-y-auto pr-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-brand-700">Coding Problems & Test Cases</h3>
                      <button
                        type="button"
                        onClick={handleAddCodingQuestion}
                        className="flex items-center gap-1 text-xs bg-brand-100 text-brand-700 px-3 py-1 rounded-md hover:bg-brand-200"
                      >
                        <FaPlus size={10} /> Add Problem
                      </button>
                    </div>

                    {codingQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white rounded-xl p-3 shadow-sm border border-brand-100 relative">
                        <button
                          type="button"
                          aria-label={`Remove problem ${qIndex + 1}`} onClick={() => handleRemoveCodingQuestion(qIndex)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <FaTrash size={12} />
                        </button>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Problem {qIndex + 1}</p>
                        <div className="space-y-2">
                          <input aria-label="Problem title"
                            type="text"
                            value={q.title}
                            onChange={(e) => handleCodingQuestionChange(qIndex, "title", e.target.value)}
                            placeholder="Problem title"
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs"
                          />
                          <textarea aria-label="Problem description"
                            rows={2}
                            value={q.description}
                            onChange={(e) => handleCodingQuestionChange(qIndex, "description", e.target.value)}
                            placeholder="Problem description"
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs"
                          />
                          <textarea aria-label="Constraints (optional)"
                            rows={2}
                            value={q.constraints}
                            onChange={(e) => handleCodingQuestionChange(qIndex, "constraints", e.target.value)}
                            placeholder="Constraints (optional)"
                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs"
                          />

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600">Max Points:</span>
                            <input
                              type="number"
                              min="1"
                              value={q.points}
                              onChange={(e) => handleCodingQuestionChange(qIndex, "points", Number(e.target.value))}
                              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-xs"
                            />
                          </div>

                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-semibold text-gray-700">Test Cases</span>
                              <button
                                type="button"
                                onClick={() => handleAddCodingTestCase(qIndex)}
                                className="flex items-center gap-1 text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded"
                              >
                                <FaPlus size={8} /> Add Case
                              </button>
                            </div>

                            {q.testCases.map((tc, tcIndex) => (
                              <div key={tcIndex} className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] text-gray-600">Case {tcIndex + 1}</span>
                                  <button
                                    type="button"
                                    aria-label={`Remove test case ${tcIndex + 1} from problem ${qIndex + 1}`} onClick={() => handleRemoveCodingTestCase(qIndex, tcIndex)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                                <textarea aria-label="Standard Input"
                                  rows={1}
                                  value={tc.input}
                                  onChange={(e) => handleCodingTestCaseChange(qIndex, tcIndex, "input", e.target.value)}
                                  placeholder="Standard Input"
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-[11px] mb-1"
                                />
                                <textarea aria-label="Expected Output"
                                  rows={1}
                                  value={tc.expectedOutput}
                                  onChange={(e) => handleCodingTestCaseChange(qIndex, tcIndex, "expectedOutput", e.target.value)}
                                  placeholder="Expected Output"
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-[11px] mb-1"
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-600">Marks:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={tc.marks}
                                      onChange={(e) => handleCodingTestCaseChange(qIndex, tcIndex, "marks", Number(e.target.value))}
                                      className="w-16 border border-gray-300 rounded-md px-2 py-0.5 text-[11px]"
                                    />
                                  </div>
                                  <label className="flex items-center gap-1 text-[10px] text-gray-600">
                                    <input
                                      type="checkbox"
                                      checked={tc.isHidden}
                                      onChange={(e) => handleCodingTestCaseChange(qIndex, tcIndex, "isHidden", e.target.checked)}
                                      className="w-3 h-3"
                                    />
                                    Hidden (Private)
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Motion.div>

        </div>


        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleSubmit}
            className={`bg-brand-600 hover:bg-brand-700 text-white px-10 py-3 rounded-lg shadow-lg text-sm font-semibold transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading} // <--- Disable button when loading
          >
            {loading ? 'Saving...' : 'Save Round Configuration'} {/* <--- Change button text while loading */}
          </button>
        </div>

        {/* Already Configured Rounds Section */}
        <div className="max-w-6xl mx-auto mt-12 space-y-6">
          {loadingRounds ? (
            <p className="text-sm text-gray-500">Loading rounds...</p>
          ) : configuredRounds.length === 0 ? (
            <p className="text-sm text-gray-500">No rounds configured yet.</p>
          ) : (
            configuredRounds.map((round, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-brand-50 p-6 rounded-xl shadow-md"
              >
                <p className="text-sm font-semibold text-brand-700">
                  {round.roundName}
                </p>

                <p className="text-xs text-gray-600 mt-2">
                  Start: {new Date(round.startTime).toLocaleString()}
                </p>

                <p className="text-xs text-gray-600">
                  End: {new Date(round.endTime).toLocaleString()}
                </p>

                <p className="text-xs text-gray-600 mt-1">
                  Minimum Marks: {round.min_marks}
                </p>
                {round.type === "CODING" && round.examId && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate(`/recruiter/${userId}/recruitment-process/${jobId}/coding-round/${round.examId}`)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
                    >
                      View Coding Round Results
                    </button>
                  </div>
                )}
              </Motion.div>
            ))
          )}
        </div>


      </div>
    </>
  );
};

export default RecruitmentProcessPage;
