import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

// --- Helper: Format time as MM:SS ---
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- Helper: Query Modal Component ---
const QueryModal = ({ question, onClose, onSubmit }) => {
  const [queryText, setQueryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) {
      setError("Please enter your query.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/student/query-question", {
        questionId: question.id,
        queryText: queryText
      });
      setSuccess("Your query has been submitted successfully.");
      setTimeout(() => {
        onClose(); // Close modal on success
      }, 1500);
    } catch (err) {
      console.error("Failed to submit query:", err);
      setError(err.response?.data?.message || "Failed to submit query.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Report an Issue</h3>
          <button onClick={onClose} className="text-2xl text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        
        {success ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-medium">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Question:</strong> {question.questionText.substring(0, 100)}...
            </p>
            <div className="mb-4">
              <label htmlFor="queryText" className="form-label">Your Query</label>
              <textarea
                id="queryText"
                rows="4"
                className="form-input"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g., I think the correct answer is missing, or this question is unclear."
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner !w-5 !h-5"></span> : "Submit Query"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


// --- Main Test Page Component ---
export default function TakeTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // State
  const [testDetails, setTestDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [markedForReview, setMarkedForReview] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [showQueryModal, setShowQueryModal] = useState(false);

  // Fetch Test Data
  useEffect(() => {
    const fetchTest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/student/mock-test/${testId}/start`);
        setTestDetails(res.data.test);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.test.duration * 60);
        setStartTime(Date.now());
      } catch (err) {
        console.error("Failed to load test:", err);
        setError(err.response?.data?.message || "Failed to load the test. Please go back.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Countdown Timer
  useEffect(() => {
    if (isLoading || timeLeft === null || isSubmitting) {
      return;
    }
    if (timeLeft <= 0) {
      handleSubmitTest(true); // Auto-submit
      return;
    }
    const timerInterval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [timeLeft, isLoading, isSubmitting]);

  // --- Handlers ---
  const handleSelectOption = (questionId, optionText) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  // --- NEW: Handle Clear Selection (Skip) ---
  const handleClearSelection = () => {
    const currentQId = questions[currentQIndex].id;
    // Create a new object without the current question ID
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[currentQId];
    setSelectedAnswers(newAnswers);
  };
  // --- END NEW ---

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQIndex(index);
  };

  const handleToggleMarkForReview = () => {
    const currentQId = questions[currentQIndex].id;
    setMarkedForReview(prev =>
      prev.includes(currentQId)
        ? prev.filter(id => id !== currentQId) // Remove if exists
        : [...prev, currentQId] // Add if not
    );
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const answeredCount = Object.keys(selectedAnswers).length;
      const totalCount = questions.length;
      const notAnswered = totalCount - answeredCount;
      let confirmMsg = `Are you sure you want to submit?\n\nAnswered: ${answeredCount}\nNot Answered: ${notAnswered}`;
      if (markedForReview.length > 0) {
        confirmMsg += `\nMarked for Review: ${markedForReview.length}`;
      }
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const formattedAnswers = Object.keys(selectedAnswers).map(qId => ({
      questionId: qId,
      selectedOptionText: selectedAnswers[qId],
    }));
    const timeTakenInSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await api.post(`/student/mock-test/${testId}/submit`, {
        answers: formattedAnswers,
        timeTaken: timeTakenInSeconds,
      });
      navigate(`/student/results/${res.data.result.attemptId}`);
    } catch (err) {
      console.error("Failed to submit test:", err);
      setError(err.response?.data?.message || "Failed to submit the test.");
      setIsSubmitting(false);
    }
  };

  // Get current question
  const currentQuestion = questions[currentQIndex];

  // Get status for a question (for nav panel)
  const getQuestionStatus = (q, index) => {
    const qId = q.id;
    if (index === currentQIndex) return 'status-current';
    const isAnswered = selectedAnswers.hasOwnProperty(qId);
    const isMarked = markedForReview.includes(qId);
    
    if (isAnswered && isMarked) return 'status-marked-answered';
    if (isMarked) return 'status-marked';
    if (isAnswered) return 'status-answered';
    return 'status-not-answered';
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <span className="spinner !w-10 !h-10 border-4 mx-auto"></span>
        <p className="mt-4 text-slate-500 animate-pulse-gentle">Loading Exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center card card-body bg-red-50 border-red-200">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={() => navigate("/student")} className="btn btn-danger w-auto mx-auto">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center card card-body">
         <h2 className="text-2xl font-bold text-slate-700 mb-4">No Questions</h2>
         <p className="text-slate-600 mb-6">This test does not have any questions yet.</p>
         <button onClick={() => navigate("/student")} className="btn btn-primary w-auto mx-auto">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const isCurrentMarked = markedForReview.includes(currentQuestion.id);
  const isCurrentAnswered = selectedAnswers.hasOwnProperty(currentQuestion.id);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeInUp">
      {/* Query Modal */}
      {showQueryModal && (
        <QueryModal
          question={currentQuestion}
          onClose={() => setShowQueryModal(false)}
        />
      )}

      {/* Test Header */}
      <div className="card card-body !p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-20 z-10 card-lighting-effect">
        <div>
          <h1 className="page-title !text-2xl !mb-1">{testDetails.title}</h1>
          <p className="text-slate-500 font-medium">
            Question {currentQIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-sm font-semibold text-red-600">Time Left</div>
          <div className="text-3xl font-bold text-red-700 tracking-wider">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Layout: Question Area + Nav Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left/Main: Question Content */}
        <div className="lg:col-span-2">
          <div className="card card-body !p-6 md:!p-8 card-lighting-effect">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-8">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.text;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(currentQuestion.id, option.text)}
                    className={`
                      block w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                      text-base md:text-lg font-medium
                      ${isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }
                    `}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
            
            {/* Action Buttons: Mark, Report, Clear */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 pt-6 gap-4">
              <div className="flex gap-3">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`btn ${isCurrentMarked ? 'btn-accent-B' : 'btn-secondary'} !px-5`}
                  disabled={isSubmitting}
                >
                  {isCurrentMarked ? "Unmark" : "Mark for Review"}
                </button>
                {/* --- NEW CLEAR/SKIP BUTTON --- */}
                <button
                  onClick={handleClearSelection}
                  className="btn btn-secondary !bg-white"
                  disabled={!isCurrentAnswered || isSubmitting}
                >
                  Clear Selection
                </button>
                {/* --- END NEW --- */}
              </div>
              
              <button
                onClick={() => setShowQueryModal(true)}
                className="btn-link-danger text-sm"
                disabled={isSubmitting}
              >
                Report Issue
              </button>
            </div>

            {/* Navigation Buttons: Prev, Next, Submit */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-6">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQIndex === 0 || isSubmitting}
                className="btn btn-secondary !px-8 !py-3 disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentQIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmitTest(false)}
                  disabled={isSubmitting}
                  className="btn btn-accent-A !px-8 !py-3 !text-base font-bold"
                >
                  {isSubmitting ? <span className="spinner !w-5 !h-5"></span> : "Submit Test"}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting}
                  className="btn btn-primary !px-8 !py-3"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right/Side: Navigation Panel */}
        <div className="lg:col-span-1">
          <div className="card card-body !p-5 card-lighting-effect sticky top-40">
            <h3 className="section-title !mb-4">Question Panel</h3>
            <div className="question-nav-panel">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`question-nav-btn ${getQuestionStatus(q, index)}`}
                  title={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-50 border-2 border-emerald-400"></div><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border-2 border-slate-300"></div><span>Not Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-50 border-2 border-purple-400"></div><span>Marked for Review</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-indigo-500 border-2 border-indigo-700"></div><span>Current</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
