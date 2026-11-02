import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Maximize2,
  Send,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import requestApi from "../../services/request";
import { Brand, EmptyState } from "../../components/ui";
export default function StudentTestPage() {
  const { userId, assessmentId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pendingRef = useRef(false);
  const expiredRef = useRef(false);
  const focusRef = useRef(null);
  useEffect(() => {
    let active = true;
    requestApi
      .get(`/exam/${assessmentId}/start`)
      .then(({ data }) => {
        if (!active) return;
        if (!data?.questions?.length) {
          setError("There are no questions available for this assessment yet.");
          return;
        }
        setQuestions(data.questions);
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "This assessment is not available right now. It may not have started yet.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [assessmentId]);
  useEffect(() => {
    if (!questions.length) return;
    const timer = setInterval(
      () => setTimeLeft((time) => Math.max(0, time - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [questions.length]);
  const submit = useCallback(async () => {
    if (pendingRef.current || !questions.length) return;
    pendingRef.current = true;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionIndex, answer]) => ({
      que_no: parseInt(
        questions[Number(questionIndex)].question_no ||
          questions[Number(questionIndex)].questionNo ||
          Number(questionIndex) + 1,
      ),
      option: answer,
    }));
    try {
      const { data } = await requestApi.post(
        `/exam/${assessmentId}/submit`,
        payload,
      );
      toast.success(
        `Assessment submitted. Score: ${data.score}/${data.totalQuestions}`,
      );
      if (document.fullscreenElement)
        await document.exitFullscreen().catch(() => {});
      navigate(`/student/${userId}/home`);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "We couldn’t submit your assessment. Please try again.",
      );
      pendingRef.current = false;
      setSubmitting(false);
    }
  }, [answers, assessmentId, navigate, questions, userId]);
  useEffect(() => {
    if (timeLeft === 0 && questions.length && !expiredRef.current) {
      expiredRef.current = true;
      submit();
    }
  }, [questions.length, submit, timeLeft]);
  const question = questions[index];
  const answered = Object.keys(answers).length;
  const timer = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;
  return (
    <main className="cn-assessment" ref={focusRef}>
      <header className="cn-exam-header">
        <Brand to={`/student/${userId}/home`} />
        <span>ASSESSMENT WORKSPACE</span>
        <div>
          <button
            className="cn-icon-button"
            aria-label="Enter fullscreen"
            onClick={() =>
              focusRef.current?.requestFullscreen?.().catch(() => {})
            }
          >
            <Maximize2 size={18} />
          </button>
          <span
            className={`cn-exam-timer ${timeLeft < 120 ? "is-urgent" : ""}`}
          >
            <Clock3 size={17} />
            {timer}
          </span>
        </div>
      </header>
      {loading ? (
        <div className="cn-route-loading" role="status">
          <LoaderCircle size={22} className="animate-spin" />
          Getting your assessment ready…
        </div>
      ) : error ? (
        <div className="cn-exam-error">
          <EmptyState
            title="Let's get you back on track."
            description={error}
            to={`/student/${userId}/home`}
            action="Return to overview"
          />
        </div>
      ) : (
        <div className="cn-exam-layout">
          <aside className="cn-exam-sidebar">
            <span className="cn-eyebrow">YOUR PROGRESS</span>
            <h2>
              {answered}
              <span> / {questions.length} answered</span>
            </h2>
            <div className="cn-exam-progress">
              <span
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>
            <div className="cn-question-grid">
              {questions.map((q, i) => (
                <button
                  key={q.question_no || q.questionNo || i}
                  className={`${index === i ? "is-current" : ""} ${answers[i] ? "is-answered" : ""}`}
                  aria-label={`Question ${i + 1}${answers[i] ? ", answered" : ", not answered"}`}
                  aria-current={index === i ? "step" : undefined}
                  onClick={() => setIndex(i)}
                >
                  {answers[i] ? <Check size={16} /> : i + 1}
                </button>
              ))}
            </div>
            <p>You can revisit any question before submitting.</p>
            <button
              className="cn-button"
              disabled={submitting}
              onClick={() => {
                if (
                  window.confirm(
                    `Submit your assessment? You have answered ${answered} of ${questions.length} questions.`,
                  )
                )
                  submit();
              }}
            >
              {submitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {submitting ? "Submitting…" : "Submit assessment"}
            </button>
          </aside>
          <section className="cn-question-panel">
            <div className="cn-section-heading">
              <span className="cn-eyebrow">
                QUESTION {index + 1} OF {questions.length}
              </span>
              <span className="cn-badge">
                {answers[index] ? "Answered" : "Not answered"}
              </span>
            </div>
            <h1>
              {question?.Question ||
                question?.question ||
                question?.questionText}
            </h1>
            <div
              className="cn-answer-options"
              role="group"
              aria-label="Choose an answer"
            >
              {question?.options?.map((option, i) => (
                <button
                  key={i}
                  className={answers[index] === option ? "is-selected" : ""}
                  aria-pressed={answers[index] === option}
                  disabled={submitting}
                  onClick={() =>
                    setAnswers((previous) => ({ ...previous, [index]: option }))
                  }
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  <strong>{option}</strong>
                  {answers[index] === option && <Check size={18} />}
                </button>
              ))}
            </div>
            <div className="cn-question-actions">
              <button
                className="cn-quiet-link"
                disabled={!answers[index] || submitting}
                onClick={() =>
                  setAnswers((previous) => {
                    const updated = { ...previous };
                    delete updated[index];
                    return updated;
                  })
                }
              >
                <RotateCcw size={14} />
                Clear answer
              </button>
              <div>
                <button
                  className="cn-button cn-button-white"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ArrowLeft size={15} />
                  Previous
                </button>
                <button
                  className="cn-button"
                  disabled={index === questions.length - 1}
                  onClick={() => setIndex(index + 1)}
                >
                  Next question
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <p className="cn-exam-hint">
              Take your time. Read each question carefully before choosing your
              answer.
            </p>
          </section>
        </div>
      )}
      <footer className="cn-exam-footer">
        <Link to={`/student/${userId}/home`}>
          <ArrowLeft size={14} />
          Return to workspace
        </Link>
        <span>CareerNexus · Focus on your next step.</span>
      </footer>
    </main>
  );
}
