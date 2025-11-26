import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaRupeeSign, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { getHostelById, createApplication } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './HostelDetail.css';

const HostelDetail = () => {
  const [hostel, setHostel] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const fetchHostel = async () => {
    const data = await getHostelById(id);
    setHostel(data);
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/student/login');
      return;
    }

    const result = await createApplication(id);
    if (result._id) {
      setMessage('Application submitted successfully!');
    } else {
      setMessage(result.message || 'Failed to submit application');
    }
  };

  if (!hostel) return <div className="loading">Loading...</div>;

  return (
    <div className="hostel-detail-container">
      <div className="hostel-detail-layout">
        {/* Left Side - Details */}
        <div className="hostel-detail-content">
          <h2>{hostel.name}</h2>
          <p className="detail-address">
            <FaMapMarkerAlt /> {hostel.address}
          </p>

          <div className="price-capacity-row">
            <div className="info-box">
              <div className="info-label">Price per Month</div>
              <div className="info-value price">
                <FaRupeeSign /> {hostel.price}
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Capacity</div>
              <div className="info-value capacity">
                <FaUsers /> {hostel.capacity}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>About this Hostel</h3>
            <p>{hostel.description}</p>
          </div>

          {hostel.amenities && hostel.amenities.length > 0 && (
            <div className="detail-section">
              <h3>Amenities & Facilities</h3>
              <ul className="amenities-list">
                {hostel.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>
          )}

          {message && <div className="message"><FaCheckCircle /> {message}</div>}
          
          {user && user.role === 'student' && (
            <button className="apply-button" onClick={handleApply}>
              Apply for this Hostel
            </button>
          )}
        </div>

        {/* Right Side - Images */}
        <div className="hostel-images-section">
          {hostel.images && hostel.images.length > 0 ? (
            <>
              <div className="main-image-container">
                <img 
                  src={hostel.images[selectedImage].url} 
                  alt={hostel.name}
                  className="main-image"
                />
              </div>
              {hostel.images.length > 1 && (
                <div className="image-gallery">
                  {hostel.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${hostel.name} ${index + 1}`}
                      className={`gallery-thumb ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-images">🏠</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelDetail;
