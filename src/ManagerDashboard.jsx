import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function ManagerDashboard() {
  const [areas, setAreas] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState({});
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

    fetch(`${API_URL}/api/volunteers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVolunteers(data.volunteers || []));
  }, []);

  function handleCreateArea(event) {
    event.preventDefault();
    fetch(`${API_URL}/api/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ address: newAddress })
    })
      .then(res => res.json())
      .then(data => {
        setAreas([...areas, data.area]);
        setNewAddress('');
      });
  }

  function handleVolunteerSelect(areaId, volunteerId) {
    setSelectedVolunteer({ ...selectedVolunteer, [areaId]: volunteerId });
  }

  function assignVolunteer(areaId) {
    fetch(`${API_URL}/api/areas/${areaId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ volunteerId: selectedVolunteer[areaId] })
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
        <h1>{name ? `${name}'s Dashboard` : 'Manager Dashboard'}</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="page">
        <div className="card">
          <form onSubmit={handleCreateArea} className="form-row">
            <input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="New area address"
            />
            <button type="submit">Create Area</button>
          </form>
        </div>

        <h2>All Areas</h2>
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
              <p><strong>Assigned to:</strong> {area.assignedTo ? area.assignedTo.name : 'Unassigned'}</p>
              {area.visitProofPhoto && (
                <img src={area.visitProofPhoto} alt="Visit proof" className="proof-photo" />
              )}

              {!area.assignedTo && (
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <select onChange={(e) => handleVolunteerSelect(area._id, e.target.value)}>
                    <option value="">-- Select Volunteer --</option>
                    {volunteers.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                  <button onClick={() => assignVolunteer(area._id)}>Assign</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ManagerDashboard;