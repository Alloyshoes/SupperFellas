// Orders.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import riceIcon from '../../assets/rice.png';
import './Orders.css';

function Orders() {
  const mapRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([1.3521, 103.8198], 13);

    // Add zoom controls to top right, offset below navbar
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: riceIcon,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -40],
      className: 'custom-rice-icon',
    });

    // Get user location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 16);

          const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
          marker.bindPopup('You are here!').openPopup();
          setUserMarker(marker);
        },
        () => {
          alert('Unable to retrieve your location.');
        }
      );
    }

    mapRef.current.mapInstance = map;
  }, []);

  const locateUser = () => {
    if (navigator.geolocation && mapRef.current.mapInstance) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current.mapInstance;

        map.setView([latitude, longitude], 16);

        if (userMarker) {
          userMarker.setLatLng([latitude, longitude]);
        } else {
          const icon = L.icon({
            iconUrl: riceIcon,
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -40],
            className: 'custom-rice-icon',
          });

          const marker = L.marker([latitude, longitude], { icon }).addTo(map);
          marker.bindPopup('You are here!').openPopup();
          setUserMarker(marker);
        }
      });
    }
  };

  return (
    <div className="orders-container">
      <div ref={mapRef} id="map" />
      <button className="locate-button" onClick={locateUser} title="Show My Location">📍</button>
    </div>
  );
}

export default Orders;
