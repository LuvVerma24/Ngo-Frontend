import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function VolunteerDashboard() {
  const [areas, setAreas] = useState(null);
  const [counts, setCounts] = useState({});
  const [photos, setPhotos] = useState({});
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

  function handlePhotoChange(areaId, file) {
    setPhotos({ ...photos, [areaId]: file });
  }

  function submitVisit(areaId) {
    const formData = new FormData();
    formData.append('oldPeopleCount', counts[areaId]);
    if (photos[areaId]) {
      formData.append('photo', photos[areaId]);
    }

    fetch(`${API_URL}/api/areas/${areaId}/visit`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
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

          {area.visitProofPhoto && (
            <img src={area.visitProofPhoto} alt="Visit proof" style={{ width: '150px', borderRadius: '8px', marginTop: '8px' }} />
          )}

          {!area.lastVisitedDate && (
            <div>
              <input
                type="number"
                placeholder="Number of old people"
                onChange={(e) => handleCountChange(area._id, e.target.value)}
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => handlePhotoChange(area._id, e.target.files[0])}
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