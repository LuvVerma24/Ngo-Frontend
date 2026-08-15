import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function VolunteerDashboard() {
  const [areas, setAreas] = useState(null);
  const [counts, setCounts] = useState({});
  const [photos, setPhotos] = useState({});
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/');
  }

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetch(`${API_URL}/api/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.areas) {
          setAreas(data.areas);
        } else {
          localStorage.clear();
          navigate('/');
        }
      });
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
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setAreas(areas.map(area => area._id === areaId ? data.area : area));
      });
  }

  if (!areas) return <p className="loading-msg">Loading... (may take up to 30s if server was idle)</p>;

  return (
    <>
      <div className="topbar">
        <h1>{name ? `${name}'s Dashboard` : 'My Dashboard'}</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="page">
        {areas.length === 0 && <div className="card"><p>No areas assigned yet.</p></div>}

        <div className="area-grid">
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
                <img src={area.visitProofPhoto} alt="Visit proof" className="proof-photo" />
              )}

              {!area.lastVisitedDate && (
                <div className="form-row" style={{ marginTop: '10px' }}>
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
      </div>
    </>
  );
}

export default VolunteerDashboard;