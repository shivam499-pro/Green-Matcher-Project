/**
 * Green Matchers - AI Features Component
 * Provides AI-powered tools: Cover Letter, Interview Tips, Skill Gap Analysis
 */
import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const AIFeatures = ({ jobId, jobTitle }) => {
  const [activeTab, setActiveTab] = useState('coverLetter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const generateCoverLetter = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.generateCoverLetter(jobId, additionalInfo);
      setData(response.data);
    } catch (err) {
      setError('Failed to generate cover letter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInterviewTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.getInterviewTips(jobId);
      setData(response.data);
    } catch (err) {
      setError('Failed to get interview tips');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGap = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.analyzeSkillGap(jobId);
      setData(response.data);
    } catch (err) {
      setError('Failed to analyze skill gap');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const matchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.matchJob(jobId);
      setData(response.data);
    } catch (err) {
      setError('Failed to analyze job match');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      setData(null);
      setError(null);
    }
  }, [jobId, activeTab]);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!data) return null;

    switch (activeTab) {
      case 'coverLetter':
        return (
          <div className="cover-letter-result">
            <h4>Generated Cover Letter for {data.job_id && `Job #${data.job_id}`}</h4>
            <div className="cover-letter-text">
              <pre>{data.cover_letter}</pre>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(data.cover_letter)}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        );

      case 'interviewTips':
        return (
          <div className="interview-tips-result">
            <h4>Interview Tips for {data.job_title}</h4>
            
            <div className="tips-section">
              <h5>📋 General Tips</h5>
              <ul>
                {data.tips?.general_tips?.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="tips-section">
              <h5>🔧 Technical Tips</h5>
              <ul>
                {data.tips?.technical_tips?.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="tips-section">
              <h5>❓ Questions to Ask</h5>
              <ul>
                {data.tips?.questions_to_ask?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'skillGap':
        return (
          <div className="skill-gap-result">
            <h4>Skill Gap Analysis for {data.job_title}</h4>
            
            {data.missing_required_skills?.length > 0 ? (
              <>
                <div className="missing-skills">
                  <h5>⚠️ Skills to Develop</h5>
                  <div className="skill-tags">
                    {data.missing_required_skills.map((skill, i) => (
                      <span key={i} className="skill-tag missing">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="learning-suggestions">
                  <h5>📚 Learning Suggestions</h5>
                  {data.learning_suggestions?.map((item, i) => (
                    <div key={i} className="suggestion-item">
                      <span className="skill-name">{item.skill}</span>
                      <span className="priority">{item.priority}</span>
                      <div className="resources">
                        {item.resources?.map((res, j) => (
                          <span key={j} className="resource">{res}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-gap">
                <p>🎉 Great! You have all the required skills for this job!</p>
              </div>
            )}
          </div>
        );

      case 'jobMatch':
        return (
          <div className="job-match-result">
            <h4>Job Match Analysis for {data.job_title}</h4>
            
            <div className="match-score">
              <div className="score-circle" style={{ 
                '--score': data.match_percentage 
              }}>
                <span>{data.match_percentage}%</span>
              </div>
              <p>Match Score</p>
            </div>

            <div className="skills-analysis">
              <div className="matched-skills">
                <h5>✅ Matched Skills ({data.matched_skills?.length})</h5>
                <div className="skill-tags">
                  {data.matched_skills?.map((skill, i) => (
                    <span key={i} className="skill-tag matched">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="missing-skills">
                <h5>❌ Missing Skills ({data.missing_skills?.length})</h5>
                <div className="skill-tags">
                  {data.missing_skills?.map((skill, i) => (
                    <span key={i} className="skill-tag missing">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {data.suggested_improvements?.length > 0 && (
              <div className="improvements">
                <h5>💡 Suggested Improvements</h5>
                <ul>
                  {data.suggested_improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ai-features">
      <div className="ai-header">
        <h3>🤖 AI-Powered Tools</h3>
        <p>Get personalized assistance for: {jobTitle || `Job #${jobId}`}</p>
      </div>

      <div className="ai-tabs">
        <button
          className={`tab-btn ${activeTab === 'coverLetter' ? 'active' : ''}`}
          onClick={() => setActiveTab('coverLetter')}
        >
          📝 Cover Letter
        </button>
        <button
          className={`tab-btn ${activeTab === 'interviewTips' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviewTips')}
        >
          💡 Interview Tips
        </button>
        <button
          className={`tab-btn ${activeTab === 'skillGap' ? 'active' : ''}`}
          onClick={() => setActiveTab('skillGap')}
        >
          📊 Skill Gap
        </button>
        <button
          className={`tab-btn ${activeTab === 'jobMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobMatch')}
        >
          🎯 Job Match
        </button>
      </div>

      <div className="ai-content card">
        {activeTab === 'coverLetter' && !data && (
          <div className="cover-letter-input">
            <label>Additional Information (Optional)</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Add any specific points you want to include in your cover letter..."
              rows={4}
            />
            <button className="btn btn-primary" onClick={generateCoverLetter}>
              Generate Cover Letter
            </button>
          </div>
        )}

        {activeTab === 'interviewTips' && !data && (
          <div className="action-prompt">
            <p>Get AI-generated interview preparation tips tailored for this job.</p>
            <button className="btn btn-primary" onClick={getInterviewTips}>
              Get Interview Tips
            </button>
          </div>
        )}

        {activeTab === 'skillGap' && !data && (
          <div className="action-prompt">
            <p>Analyze the gap between your skills and the job requirements.</p>
            <button className="btn btn-primary" onClick={analyzeSkillGap}>
              Analyze Skill Gap
            </button>
          </div>
        )}

        {activeTab === 'jobMatch' && !data && (
          <div className="action-prompt">
            <p>See how well your profile matches this job.</p>
            <button className="btn btn-primary" onClick={matchJob}>
              Analyze Job Match
            </button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default AIFeatures;
