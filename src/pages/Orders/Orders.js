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
  const [userLocation, setUserLocation] = useState(null); // NEW: to store user's lat/lng
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const markerRefs = useRef({});

  const MAX_DISTANCE_KM = 3; // NEW: distance threshold

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
      iconAnchor: [25, 50],
      popupAnchor: [0, -40],
    });

    const food = L.icon({
      iconUrl: foodIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserLocation({ latitude, longitude }); // NEW
        map.setView([latitude, longitude], 15);
        const marker = L.marker([latitude, longitude], { icon: rice }).addTo(map);
        marker.bindPopup('You are here!').openPopup();
        marker.on('click', () => map.setView([latitude, longitude], 17));
        setUserMarker(marker);
      },
      () => alert('Unable to retrieve your location.')
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

        setOrders(allOrders); // set all orders here
      }
    });

    mapInstanceRef.current = map;
  }, [app]);

  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;

    const food = L.icon({
      iconUrl: foodIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    Object.values(markerRefs.current).forEach(m => mapInstanceRef.current.removeLayer(m));
    markerRefs.current = {};

    orders.forEach(order => {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, order.lat, order.lon);
      if (distance <= MAX_DISTANCE_KM) {
        const marker = L.marker([order.lat, order.lon], { icon: food }).addTo(mapInstanceRef.current);
        markerRefs.current[order.id] = marker;
        marker.on('click', () => {
          mapInstanceRef.current.setView([order.lat, order.lon], 16);
          setExpandedOrderId(order.id);
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

        const rice = L.icon({
          iconUrl: riceIcon,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -40],
        });

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

  const handleTitleClick = (order) => {
    setExpandedOrderId(prev => prev === order.id ? null : order.id);
    const marker = markerRefs.current[order.id];
    if (marker && mapInstanceRef.current) {
      mapInstanceRef.current.setView(marker.getLatLng(), 16);
    }
  };

  const filteredOrders = orders
    .filter(order =>
      order.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(order => {
      if (!userLocation) return true;
      const d = calculateDistance(userLocation.latitude, userLocation.longitude, order.lat, order.lon);
      return d <= MAX_DISTANCE_KM;
    });

  return (
    <div className="orders-container">
      <div className="map-container">
        <div ref={mapRef} id="map" />
        <button className="locate-button" onClick={locateUser} title="Show My Location">📍</button>

        <div className="orders-search-panel">
          <input
            type="text"
            placeholder="Search orders..."
            className="orders-search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-tile">
                <div className="order-title" onClick={() => handleTitleClick(order)}>
                  {order.title}
                </div>
                <div className={`order-details-wrapper ${expandedOrderId === order.id ? 'open' : ''}`}>
                  <div className="order-details">
                    <p><strong>Location:</strong> {order.restaurantName || 'N/A'}</p>
                    <p><strong>User:</strong> {order.user || 'N/A'}</p>
                    <p><strong>Distance:</strong> {order.distanceInfo || 'N/A'}</p>
                    <p><strong>Cuisine:</strong> {order.cuisineInfo || 'N/A'}</p>
                    <a href={`/order/${order.id}`} className="join-link">Join Order</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
