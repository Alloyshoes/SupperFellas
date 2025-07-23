// Orders.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import riceIcon from '../../assets/rice.png';
import './Orders.css';

function Orders() {
  const mapRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([1.3521, 103.8198], 13);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const icon = L.icon({
      iconUrl: riceIcon,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -40],
      className: 'custom-rice-icon',
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          map.setView([latitude, longitude], 16);
          const marker = L.marker([latitude, longitude], { icon }).addTo(map);
          marker.bindPopup('You are here!').openPopup();
          setUserMarker(marker);
        },
        () => alert('Unable to retrieve your location.')
      );
    }

    mapRef.current.mapInstance = map;
  }, []);

  const locateUser = () => {
    if (navigator.geolocation && mapRef.current.mapInstance) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
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

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`
      );
      const data = await res.json();
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectLocation = (lat, lon, displayName) => {
    const map = mapRef.current.mapInstance;
    map.setView([lat, lon], 16);

    if (userMarker) {
      userMarker.setLatLng([lat, lon]).bindPopup(displayName).openPopup();
    } else {
      const icon = L.icon({
        iconUrl: riceIcon,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -40],
        className: 'custom-rice-icon',
      });

      const marker = L.marker([lat, lon], { icon }).addTo(map);
      marker.bindPopup(displayName).openPopup();
      setUserMarker(marker);
    }

    setSearchQuery(displayName);
    setSuggestions([]);
  };

  return (
    <div className="orders-container">
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectLocation(parseFloat(s.lat), parseFloat(s.lon), s.display_name)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={mapRef} id="map" />
      <button className="locate-button" onClick={locateUser} title="Show My Location">📍</button>
    </div>
  );
}

export default Orders;
