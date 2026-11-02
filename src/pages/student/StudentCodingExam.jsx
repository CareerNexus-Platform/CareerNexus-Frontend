import { apiErrorMessage } from "../../services/apiConfig";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import requestApi from "../../services/request";
import toast from "react-hot-toast";
import CodeEditor from "./studentPractice/CodeEditor";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTerminal,
  FaPaperPlane,
  FaAward,
} from "react-icons/fa";
import getUserId from "../../services/getUserId";

const StudentCodingExam = () => {
  const { userId, assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store code for each question: { questionId: { code: string, language: string } }
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await requestApi.get(`/coding-exam/${assessmentId}/start`);
        setAssessment(res.data);

        // Initialize answers
        const initialAnswers = {};
        res.data.questions.forEach((q) => {
          initialAnswers[q.id] = {
            code: q.title.toLowerCase().includes("java")
              ? ""
              : "// Write your code here...",
            language: "javascript",
          };
        });
        setAnswers(initialAnswers);
      } catch (err) {
        const errorMsg =
          apiErrorMessage(err, "Failed to load exam. It might have ended.");
        toast.error(errorMsg);
        navigate("/student/" + getUserId() + "/coding-assessments");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [assessmentId, navigate]);

  const handleCodeUpdate = (newCode) => {
    if (!assessment) return;
    const qId = assessment.questions[currentQuestionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], code: newCode },
    }));
  };

  const handleLanguageUpdate = (newLang) => {
    if (!assessment) return;
    const qId = assessment.questions[currentQuestionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], language: newLang },
    }));
  };

  const handleSubmitExam = async () => {
    if (
      !window.confirm(
        "Are you sure you want to submit this coding practice test? You cannot make changes after this submission.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const submissions = Object.keys(answers).map((qId) => ({
        questionId: parseInt(qId),
        code: answers[qId].code,
        language: answers[qId].language,
      }));

      const res = await requestApi.post(`/coding-exam/${assessmentId}/submit`, {
        submissions,
      });
      toast.success(
        `Practice submitted! Your score: ${res.data.totalScore} / ${res.data.maxScore}`,
      );
      navigate("/student/" + userId + "/coding-assessments");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Submission failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-ink flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500 mb-4"></div>
        <p className="text-xl font-medium">
          Entering secure exam environment...
        </p>
      </div>
    );

  if (!assessment) return null;

  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <div className="cn-studio cn-coding-exam h-screen bg-ink flex flex-col overflow-hidden font-poppins">
      {/* Exam Header */}
      <header className="h-16 bg-ink border-b border-gray-800 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-600 p-2 rounded-lg">
            <FaTerminal className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wide">
              {assessment.assessmentName}
            </h1>
            <p className="text-xs text-gray-400">Student: {userId}</p>
            {assessment.totalScore != null && assessment.maxScore != null && (
              <p className="text-xs text-brand-400 mt-1">
                Last practice score: {assessment.totalScore} /{" "}
                {assessment.maxScore}
              </p>
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="hidden md:flex items-center gap-2">
          {assessment.questions.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                                ${currentQuestionIndex === idx ? "bg-brand-600 text-white scale-110 shadow-[0_0_12px_rgba(65, 45, 32,0.5)]" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-brand-600 to-brand-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition disabled:opacity-50"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <FaPaperPlane /> Submit Assessment
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <Motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {/*
                          CRITICAL: We pass the question to CodeEditor.
                          CodeEditor internally renders QuestionPanel + MonacoCodeEditor.
                          However, CodeEditor captures code state internally.
                          We need a way to 'sync' our 'answers' state with CodeEditor.
                        */}
            <CodeEditor
              initialCode={answers[currentQuestion.id]?.code}
              sessionId={`exam-${assessmentId}-${currentQuestion.id}`} // Unique session per question
              username={userId}
              question={currentQuestion}
              initialLanguage={
                answers[currentQuestion.id]?.language || "javascript"
              }
              onCodeChange={handleCodeUpdate}
              onLanguageChange={handleLanguageUpdate}
            />
          </Motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Question Controls */}
      <footer className="h-14 bg-ink border-t border-gray-800 flex items-center justify-between px-6">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          className="text-gray-400 flex items-center gap-2 hover:text-white disabled:opacity-20 transition"
        >
          <FaChevronLeft /> Previous Challenge
        </button>

        <div className="flex items-center gap-2 text-brand-400 font-bold bg-brand-400/10 px-4 py-1 rounded-full text-sm">
          <FaAward /> {currentQuestion.points} Points
        </div>

        <button
          disabled={currentQuestionIndex === assessment.questions.length - 1}
          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
          className="text-gray-400 flex items-center gap-2 hover:text-white disabled:opacity-20 transition"
        >
          Next Challenge <FaChevronRight />
        </button>
      </footer>
    </div>
  );
};

export default StudentCodingExam;
