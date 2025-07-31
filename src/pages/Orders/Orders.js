import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDatabase, ref, get } from 'firebase/database';
import foodIcon from '../../assets/foodpt.png';
import riceIcon from '../../assets/rice.png';
import './Orders.css';

function Orders({ app }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [openRestaurant, setOpenRestaurant] = useState(null);
  const markerRefs = useRef({});

  const MAX_DISTANCE_KM = 50;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchReviews = async (restaurantName) => {
    if (!restaurantName) return null;
    const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const safeName = restaurantName.replace(/\./g, '(dot)');
    const reviewsRef = ref(db, `Reccomendations/${safeName}`);
    const snapshot = await get(reviewsRef);
    if (!snapshot.exists()) return null;
    return snapshot.val();
  };

  const enrichOrdersWithReviews = async (orderList) => {
    const result = {};
    for (const order of orderList) {
      if (!order.restaurantName) continue;
      const reviews = await fetchReviews(order.restaurantName);
      result[order.restaurantName] = reviews || {};
    }
    setReviewsMap(result);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([1.3521, 103.8198], 12);
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const rice = L.icon({
      iconUrl: riceIcon,
      iconSize: [50, 50],
      iconAnchor: [25, 50],       // keeps the bottom center of the icon as anchor
      popupAnchor: [0, -50],      // moves the popup upward to point to top of icon
    });

    const food = L.icon({ iconUrl: foodIcon, iconSize: [40, 40], iconAnchor: [20, 40] });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserLocation({ latitude, longitude });
        map.setView([latitude, longitude], 15);
        const marker = L.marker([latitude, longitude], { icon: rice }).addTo(map);
        marker.bindPopup('You are here!').openPopup();
        setUserMarker(marker);
      },
      () => {
        alert('Unable to retrieve your location.');
        var coords = {
          latitude: 1.2976,
          longitude: 103.7767
          // coords of NUS (default)
        };
        const { latitude, longitude } = coords;
        setUserLocation({ latitude, longitude });
        map.setView([latitude, longitude], 15);
        const marker = L.marker([latitude, longitude], { icon: rice }).addTo(map);
        marker.bindPopup('You are here!').openPopup();
        setUserMarker(marker);
      }
    );
    const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const postsRef = ref(db, 'posts');

    get(postsRef).then(snapshot => {
      if (snapshot.exists()) {
        const posts = snapshot.val();
        const allOrders = [];

        Object.entries(posts).forEach(([postId, postData]) => {
          if (postData.coords?.length === 2) {
            const [lat, lon] = postData.coords.map(Number);
            if (!isNaN(lat) && !isNaN(lon)) {
              allOrders.push({ id: postId, lat, lon, ...postData });
            }
          }
        });

        setOrders(allOrders);
        enrichOrdersWithReviews(allOrders);
      }
    });

    mapInstanceRef.current = map;
  }, [app]);

  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;

    const food = L.icon({ iconUrl: foodIcon, iconSize: [40, 40], iconAnchor: [20, 40] });

    Object.values(markerRefs.current).forEach(m => mapInstanceRef.current.removeLayer(m));
    markerRefs.current = {};

    orders.forEach(order => {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, order.lat, order.lon);
      if (distance <= MAX_DISTANCE_KM) {
        const marker = L.marker([order.lat, order.lon], { icon: food }).addTo(mapInstanceRef.current);
        markerRefs.current[order.id] = marker;
        marker.on('click', () => {
          mapInstanceRef.current.setView([order.lat, order.lon], 16);
          setSelectedRestaurant(order.restaurantName);
          setOpenRestaurant(order.restaurantName);
        });
      }
    });
  }, [orders, userLocation]);

  const locateUser = () => {
    const map = mapInstanceRef.current;
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        map.setView([latitude, longitude], 17);
        setUserLocation({ latitude, longitude });

        const rice = L.icon({ iconUrl: riceIcon, iconSize: [50, 50], iconAnchor: [25, 50] });

        if (userMarker) {
          userMarker.setLatLng([latitude, longitude]);
        } else {
          const marker = L.marker([latitude, longitude], { icon: rice }).addTo(map);
          marker.bindPopup('You are here!').openPopup();
          setUserMarker(marker);
        }
      });
    }
  };

  const filteredOrders = orders
    .filter(order => order.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(order => {
      if (!userLocation) return true;
      const d = calculateDistance(userLocation.latitude, userLocation.longitude, order.lat, order.lon);
      return d <= MAX_DISTANCE_KM;
    });

  const getReviewStats = (reviewsObj) => {
    const ratings = Object.values(reviewsObj).map(r => Number(r.rating) || 0);
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    ratings.forEach(r => {
      if (r >= 1 && r <= 5) counts[r - 1]++;
    });
    const total = ratings.length;
    const avg = total > 0 ? (ratings.reduce((a, b) => a + b, 0) / total).toFixed(1) : 0;
    return { counts, avg, total };
  };

  return (
    <div className="orders-container">
      <div className="map-container">
        <div ref={mapRef} id="map" />
        <button className="locate-button" onClick={locateUser}>📍</button>

        <div className="orders-search-panel">
          <input
            type="text"
            className="orders-search-bar"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-tile" onClick={() => {
                const newState = openRestaurant === order.restaurantName ? null : order.restaurantName;
                setOpenRestaurant(newState);
                setSelectedRestaurant(order.restaurantName);
              }}>
                <div className="order-title">{order.title}</div>
                {openRestaurant === order.restaurantName && (
                  <div className="order-details-wrapper open">
                    <div className="order-details">
                      <a href={`/order/${order.id}`} className="join-link">Join Group Order</a>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {selectedRestaurant && reviewsMap[selectedRestaurant] && (
          <div className="recommendations-panel">
            <h3>{selectedRestaurant}</h3>
            {(() => {
              const stats = getReviewStats(reviewsMap[selectedRestaurant]);
              return (
                <>
                  <div className="review-summary">
                    <div className="avg-rating">{stats.avg}</div>
                    <div className="star-counts">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="star-bar">
                          <span>{star}</span>
                          <div className="bar">
                            <div
                              className="fill"
                              style={{ width: `${(stats.counts[star - 1] / stats.total) * 100 || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="review-total">{stats.total} reviews</div>
                    </div>
                  </div>
                  {Object.values(reviewsMap[selectedRestaurant]).map((rev, i) => (
                    <div key={i} className="recommendation-tile">
                      <div className="review-header">
                        <strong>{rev.user}</strong>
                        <span className="rating-stars">⭐ {rev.rating}</span>
                      </div>
                      {rev.image && <img src={rev.image} alt="review" className="review-image" />}
                      <p>{rev.review}</p>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
