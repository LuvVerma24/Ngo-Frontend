import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function VolunteerDashboard() {
  const [areas, setAreas] = useState(null);
  const [counts, setCounts] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/api/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAreas(data.areas));
  }, []);

  function handleCountChange(areaId, value) {
    setCounts({ ...counts, [areaId]: value });
  }

  function submitVisit(areaId) {
    fetch(`${API_URL}/api/areas/${areaId}/visit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPeopleCount: counts[areaId] })
    })
      .then(res => res.json())
      .then(data => {
        setAreas(areas.map(area => area._id === areaId ? data.area : area));
      });
  }

  if (!areas) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h1>My Assigned Areas</h1>
      {areas.length === 0 && <div className="card"><p>No areas assigned yet.</p></div>}

      {areas.map(area => (
        <div key={area._id} className="card">
          <p><strong>Address:</strong> {area.address}</p>
          <p>
            Status:{' '}
            <span className={area.lastVisitedDate ? 'status-visited' : 'status-pending'}>
              {area.lastVisitedDate ? 'Visited' : 'Pending'}
            </span>
          </p>

          {!area.lastVisitedDate && (
            <div className="form-row">
              <input
                type="number"
                placeholder="Number of old people"
                onChange={(e) => handleCountChange(area._id, e.target.value)}
              />
              <button onClick={() => submitVisit(area._id)}>Submit Visit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default VolunteerDashboard;