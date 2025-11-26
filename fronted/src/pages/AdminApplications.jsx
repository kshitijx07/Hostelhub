import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAdminApplications, updateApplicationStatus } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaFilter } from 'react-icons/fa';
import './AdminApplications.css';

const AdminApplications = () => {
  const { token } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'All',
    hostel: 'All'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  const fetchData = async () => {
    const [appsData, hostelsRes] = await Promise.all([
      getAdminApplications(),
      fetch('http://localhost:5000/api/hostels/admin/my-hostels', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    const hostelsData = await hostelsRes.json();
    setApplications(appsData);
    setHostels(hostelsData);
    setFilteredApplications(appsData);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.status !== 'All') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.hostel !== 'All') {
      filtered = filtered.filter(app => app.hostelId._id === filters.hostel);
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (id, status) => {
    await updateApplicationStatus(id, status);
    fetchData();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Loading applications...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-applications-container">
        <div className="page-header">
          <div>
            <h1>Applications</h1>
            <p>Manage all hostel applications</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <FaFilter />
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={filters.hostel}
              onChange={(e) => setFilters({...filters, hostel: e.target.value})}
            >
              <option value="All">All Hostels</option>
              {hostels.map(hostel => (
                <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
              ))}
            </select>
          </div>

          <div className="results-count">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <p className="no-applications">No applications found.</p>
        ) : (
          <div className="admin-applications-list">
            {filteredApplications.map(app => (
            <div key={app._id} className="admin-app-card">
              <div className="app-header">
                <h3>{app.studentId.name}</h3>
                <span className={`status-badge ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>
              <p><strong>Email:</strong> {app.studentId.email}</p>
              <p><strong>Phone:</strong> {app.studentId.phone}</p>
              <p><strong>Hostel:</strong> {app.hostelId.name}</p>
              <p><strong>Address:</strong> {app.hostelId.address}</p>
              <p className="app-date">
                Applied: {new Date(app.createdAt).toLocaleDateString()}
              </p>
              {app.status === 'Pending' && (
                <div className="action-buttons">
                  <button 
                    className="accept-btn"
                    onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
