import React, { useState, useEffect } from 'react';
import './Popup.css';
import youtube from '../Popup/imgs/youtube.png';
import StudentView from './Studentview';
import InstructorView from './InstructorView';

const Popup = () => {
  const [userRole, setUserRole] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [tokenStatus, setTokenStatus] = useState('');

  const getCanvasBaseUrl = () => {
    const url = window.location.href;
    const match = url.match(/(https?:\/\/[^\/]+)/);
    return match ? match[1] : null;
  };

  const fetchCurrentCourseId = () => {
    const url = window.location.href;
    const match = url.match(/\/courses\/(\d+)/);
    return match && match[1] ? match[1] : null;
  };

  const validateToken = async (token) => {
    const baseUrl = getCanvasBaseUrl();
    if (!baseUrl) {
      setTokenStatus('Error: Unable to determine Canvas URL');
      return false;
    }

    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    try {
      const response = await fetch(`${baseUrl}/api/v1/users/self`, {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json();
      setTokenStatus('Token validated successfully!');
      return true;
    } catch (error) {
      setTokenStatus('Invalid token. Please check and try again.');
      return false;
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const baseUrl = getCanvasBaseUrl();
      const courseId = fetchCurrentCourseId();
      const storedToken = localStorage.getItem('apiToken');

      if (!baseUrl || !courseId || !storedToken) {
        console.error('Missing base URL, course ID, or API token');
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${storedToken}`);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      try {
        const response = await fetch(
          `${baseUrl}/api/v1/courses/${courseId}/enrollments?user_id=self`,
          requestOptions
        );
        const enrollmentData = await response.json();
        const role = enrollmentData[0].type;
        console.log('User role:', role);
        setUserRole(role);

        if (role === 'StudentEnrollment') {
          fetchAssignments(baseUrl, courseId, storedToken);
        } else if (role === 'TeacherEnrollment') {
          fetchStudents(baseUrl, courseId, storedToken);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    if (localStorage.getItem('apiToken')) {
      fetchUserRole();
    }
  }, []);

  const fetchAssignments = async (baseUrl, courseId, token) => {
    // Implement assignment fetching logic here
  };

  const fetchStudents = async (baseUrl, courseId, token) => {
    // Implement student fetching logic here
  };

  const removeToken = () => {
    localStorage.removeItem('apiToken');
    setApiToken('');
    setUserRole('');
    setAssignments([]);
    setStudents([]);
    setTokenStatus('');
  };

  const handleTokenSubmit = async () => {
    setTokenStatus('Validating token...');
    const isValid = await validateToken(apiToken);
    if (isValid) {
      localStorage.setItem('apiToken', apiToken);
      window.location.reload();
    }
  };

  return (
    <div className="container">
      {!userRole && (
        <>
          <div className="token-input-container">
            <input
              type="password"
              value={apiToken}
              onChange={e => setApiToken(e.target.value)}
              placeholder="Enter your Canvas API token"
              className="token-input"
            />
            <button
              onClick={handleTokenSubmit}
              className="token-submit"
            >
              Submit Token
            </button>
            {tokenStatus && (
              <p className={`token-status ${tokenStatus.includes('successfully') ? 'success' : 'error'}`}>
                {tokenStatus}
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              className="feedback-button px-4 py-2 rounded"
              onClick={() => window.open('https://forms.gle/your-feedback-form-url', "_blank")}
            >
              Give Feedback
            </button>
          </div>
        </>
      )}
      {userRole === 'TeacherEnrollment' ? (
        <>
          <InstructorView students={students} />
          <button onClick={removeToken} className="token-remove">
            Remove Token
          </button>
        </>
      ) : userRole === 'StudentEnrollment' ? (
        <>
          <StudentView assignments={assignments} />
          <button onClick={removeToken} className="token-remove">
            Remove Token
          </button>
        </>
      ) : (
        <p>Please enter your API token to view your data.</p>
      )}
    </div>
  );
};

export default Popup;
