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
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([1.3521, 103.8198], 12);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const rice = L.icon({
      iconUrl: riceIcon,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -40],
      className: 'custom-rice-icon',
    });

    const food = L.icon({
      iconUrl: foodIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      className: 'custom-food-icon',
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          map.setView([latitude, longitude], 15);
          const marker = L.marker([latitude, longitude], { icon: rice }).addTo(map);
          marker.bindPopup('You are here!').openPopup();
          marker.on('click', () => {
            map.setView([latitude, longitude], 17);
          });
          setUserMarker(marker);
        },
        () => alert('Unable to retrieve your location.')
      );
    }

    const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const postsRef = ref(db, 'posts');

    get(postsRef).then(snapshot => {
      if (snapshot.exists()) {
        const posts = snapshot.val();
        Object.entries(posts).forEach(([postId, postData]) => {
          if (postData.coords && Array.isArray(postData.coords) && postData.coords.length === 2) {
            const [lat, lon] = postData.coords.map(Number);
            if (!isNaN(lat) && !isNaN(lon)) {
              const marker = L.marker([lat, lon], { icon: food }).addTo(map);
              marker.on('click', () => setSelectedOrder({ id: postId, ...postData }));
            }
          }
        });
      }
    });

    mapInstanceRef.current = map;
  }, [app]);

  const locateUser = () => {
    const map = mapInstanceRef.current;
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        map.setView([latitude, longitude], 17);

        const rice = L.icon({
          iconUrl: riceIcon,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -40],
          className: 'custom-rice-icon',
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

  return (
    <div className="orders-container">
      <div className="map-container">
        <div ref={mapRef} id="map" />
        <button className="locate-button" onClick={locateUser} title="Show My Location">📍</button>
      </div>

      {selectedOrder && (
        <div className="side-panel">
          <h2>Order Details</h2>
          <p><strong>Title:</strong> {selectedOrder.title || 'N/A'}</p>
          <p><strong>Location:</strong> {selectedOrder.restaurantName || 'N/A'}</p>
          <p><strong>User:</strong> {selectedOrder.user || 'N/A'}</p>
          <p><strong>Distance:</strong> {selectedOrder.distanceInfo || 'N/A'}</p>
          <p><strong>Cuisine:</strong> {selectedOrder.cuisineInfo || 'N/A'}</p>
          <a
            href={`/order/${selectedOrder.id}`}
            className="join-link"
          >
            Join Order
          </a>
          <br />
          <button onClick={() => setSelectedOrder(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Orders;
