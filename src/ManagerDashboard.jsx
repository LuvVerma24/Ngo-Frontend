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
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }

  useEffect(() => {
    fetch(`${API_URL}/api/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAreas(data.areas));

    fetch(`${API_URL}/api/volunteers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVolunteers(data.volunteers));
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

  if (!areas) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h1>Manager Dashboard</h1>
      <button onClick={handleLogout} className="secondary">Logout</button>

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
            <img src={area.visitProofPhoto} alt="Visit proof" style={{ width: '150px', borderRadius: '8px', marginTop: '8px' }} />
          )}

          {!area.assignedTo && (
            <div className="form-row">
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
  );
}

export default ManagerDashboard;