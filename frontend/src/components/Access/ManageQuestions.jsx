import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import './ManageQuestions.css'; 

// --- Single Question Form ---
function AddQuestionForm({ testId, onQuestionAdded }) {
  // ... (Your existing state)
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [marks, setMarks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... (Your existing handlers: handleOptionChange, handleCorrectOptionChange)
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  // ... (Your existing handleSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!questionText.trim()) {
      setError('Question text cannot be empty.');
      setLoading(false);
      return;
    }
    const filledOptions = options.filter(opt => opt.text.trim() !== '');
    if (filledOptions.length < 2) {
      setError('Please provide at least 2 options.');
      setLoading(false);
      return;
    }
    const correctCount = filledOptions.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      setError('Please select exactly one correct answer.');
      setLoading(false);
      return;
    }

    try {
      await api.post(`/access/mock-test/${testId}/question`, {
        questionText,
        options: filledOptions,
        marks,
      });
      setQuestionText('');
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setMarks(1);
      onQuestionAdded(); // This will refresh the list in the parent
    } catch (err) {
      console.error('Failed to add question:', err);
      setError(err.response?.data?.message || 'Failed to add question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed card-lighting-effect
    <form onSubmit={handleSubmit} className="card card-form">
      <h3 className="section-title">Add New Question</h3>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="form-group">
        <label className="form-label" htmlFor="q-text">Question Text</label>
        <textarea
          id="q-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="form-input"
          placeholder="e.g., What is the capital of Tamil Nadu?"
          rows="3"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Options</label>
        <div className="options-container">
          {options.map((opt, index) => (
            <div key={index} className="option-row">
              <input
                type="radio"
                name="correct-option"
                checked={opt.isCorrect}
                onChange={() => handleCorrectOptionChange(index)}
                className="form-radio"
                title="Mark as correct answer"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="form-input"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="q-marks">Marks</label>
        <input
          id="q-marks"
          type="number"
          min="1"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
          className="form-input marks-input"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <span className="spinner small"></span> : "Add Question"}
      </button>
    </form>
  );
}

// --- Bulk Upload Form ---
function BulkUploadForm({ testId, onQuestionAdded }) {
  // ... (Your existing state)
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ... (Your existing handlers: handleFileChange, handleSubmit)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/access/mock-test/${testId}/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(res.data.message);
      setFile(null); // Clear file input
      document.getElementById('bulk-file-input').value = null; 
      onQuestionAdded(); // Refresh parent list
    } catch (err) {
      console.error('Failed to bulk upload questions:', err);
      setError(err.response?.data?.message || 'Failed to upload questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed card-lighting-effect
    <form onSubmit={handleSubmit} className="card card-form">
      <h3 className="section-title">Bulk Upload Questions</h3>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      <div className="form-group">
        <label className="form-label" htmlFor="bulk-file-input">JSON File</label>
        <input
          id="bulk-file-input"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="form-input"
        />
        <p className="form-help-text">
          Upload a JSON file with an array of questions. 
          <a href="/#" onClick={(e) => e.preventDefault()} className="btn-link" title="See format in console log"> (See format info)</a>
        </p>
      </div>
      <button type="submit" className="btn btn-secondary" disabled={loading}>
        {loading ? <span className="spinner small"></span> : "Upload Bulk File"}
      </button>
    </form>
  );
}

// --- Main Page Component ---
export default function ManageQuestions() {
  // ... (Your existing state)
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (Your existing handlers: loadData, useEffect, deleteQuestion)
  const loadData = async () => {
    if (!test) setLoading(true);
    setError(null);
    try {
      const [testRes, questionsRes] = await Promise.all([
        api.get(`/access/mock-test/${testId}`),
        api.get(`/access/mock-test/${testId}/questions`)
      ]);
      setTest(testRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error('Failed to load test data:', err);
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };
// Inside src/components/Access/ManageQuestions.jsx

  useEffect(() => {
    loadData();
    // Log the required JSON format for the user
    console.log("Bulk Upload JSON Format:", [
      {
        questionText: "Question text here",
        options: [ // <-- This is the fix
          { text: "Option 1", isCorrect: false },
          { text: "Option 2 (Correct)", isCorrect: true }
        ],
        marks: 1
      }
    ]);
  }, [testId]);
  const deleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/access/question/${questionId}`);
      loadData();
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert(`Error: ${err.response?.data?.message || 'Could not delete question.'}`);
    }
  };


  if (loading && !test) {
    return (
      <div className="loading-placeholder">
        <span className="spinner"></span>
        <p>Loading Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card alert alert-danger">
          <h2 className="alert-title">Error</h2>
          <p>{error}</p>
          <Link to="/access" className="btn btn-danger">
            Back to Content Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeInUp">
      <div className="page-header">
        <Link to="/access" className="btn-link btn-link-back">
          ← Back to Content Manager
        </Link>
        <h1 className="page-title">Manage Questions</h1>
        <p className="page-subtitle">
          For test: <span className="highlight-text">{test?.title}</span>
        </p>
      </div>

      <div className="page-grid">
        <div className="form-column">
          <AddQuestionForm testId={testId} onQuestionAdded={loadData} />
          <BulkUploadForm testId={testId} onQuestionAdded={loadData} />
        </div>

        <div className="list-column">
          <h3 className="section-title">
            Current Questions ({questions.length})
          </h3>
          {/* Removed card-lighting-effect */}
          <div className="card card-list">
            {questions.length > 0 ? (
              <ul className="question-list">
                {questions.map((q, index) => (
                  <li key={q.id} className="question-item">
                    <div className="question-item-header">
                      <p className="question-text">
                        {index + 1}. {q.questionText}
                      </p>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="btn-link-danger btn-delete"
                      >
                        DELETE
                      </button>
                    </div>
                    <ul className="options-list-display">
                      {q.options.map((opt, i) => (
                        <li
                          key={i}
                          className={`option-display ${opt.isCorrect ? 'correct' : ''}`}
                        >
                          {opt.text} {opt.isCorrect && '(Correct)'}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-list-text">
                No questions added yet. Use the forms to add them.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}