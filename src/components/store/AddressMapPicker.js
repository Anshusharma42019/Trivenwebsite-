'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Loader2,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';

// Known Indian PIN Code coordinates database for instant zero-latency positioning
const PIN_CODE_DATABASE = {
  '249401': { lat: 30.0869, lng: 78.2676, city: 'Rishikesh', state: 'Uttarakhand', locality: 'Tapovan / Rishikesh' },
  '248001': { lat: 30.3165, lng: 78.0322, city: 'Dehradun', state: 'Uttarakhand', locality: 'Rajpur Road / Clock Tower' },
  '110001': { lat: 28.6304, lng: 77.2177, city: 'New Delhi', state: 'Delhi', locality: 'Connaught Place / Central Delhi' },
  '110016': { lat: 28.5447, lng: 77.1926, city: 'New Delhi', state: 'Delhi', locality: 'Hauz Khas / Green Park' },
  '400001': { lat: 18.9322, lng: 72.8336, city: 'Mumbai', state: 'Maharashtra', locality: 'Fort / South Mumbai' },
  '400050': { lat: 19.0596, lng: 72.8295, city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra West' },
  '560001': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka', locality: 'MG Road / Central Bangalore' },
  '560034': { lat: 12.9279, lng: 77.6271, city: 'Bengaluru', state: 'Karnataka', locality: 'Koramangala' },
  '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu', locality: 'George Town / Central Chennai' },
  '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal', locality: 'BBD Bagh / Central Kolkata' },
  '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan', locality: 'M.I. Road / Pink City' },
  '302006': { lat: 26.8918, lng: 75.7923, city: 'Jaipur', state: 'Rajasthan', locality: 'Civil Lines' },
  '500001': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana', locality: 'Abids / Central Hyderabad' },
  '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat', locality: 'Lal Darwaja' },
  '226001': { lat: 26.8467, lng: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Hazratganj' },
  '226010': { lat: 26.8520, lng: 80.9850, city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Gomti Nagar Extension' },
  '226016': { lat: 26.8780, lng: 80.9920, city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Indira Nagar' },
  '226021': { lat: 26.8560, lng: 80.9980, city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Gomti Nagar / Vibhuti Khand' },
  '226024': { lat: 26.8920, lng: 80.9450, city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Aliganj' },
  '201301': { lat: 28.5355, lng: 77.3910, city: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 18 / Atta Market' },
  '201309': { lat: 28.6280, lng: 77.3649, city: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 62' },
  '122001': { lat: 28.4595, lng: 77.0266, city: 'Gurugram', state: 'Haryana', locality: 'Old Railway Road' },
  '122002': { lat: 28.4720, lng: 77.0850, city: 'Gurugram', state: 'Haryana', locality: 'DLF Phase 1 / Cyber City' },
  '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra', locality: 'Camp / Shivaji Nagar' },
  '160017': { lat: 30.7333, lng: 76.7794, city: 'Chandigarh', state: 'Punjab', locality: 'Sector 17' },
  '682001': { lat: 9.9312, lng: 76.2673, city: 'Kochi', state: 'Kerala', locality: 'Fort Kochi' },
};

export default function AddressMapPicker({
  isOpen,
  onClose,
  initialPincode = '',
  initialCity = '',
  onLocationSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: 28.6304, lng: 77.2177 });
  const [addressDetails, setAddressDetails] = useState({
    locality: 'Connaught Place / Central Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  });
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize coords from PIN code if available
  useEffect(() => {
    if (initialPincode && PIN_CODE_DATABASE[initialPincode]) {
      const match = PIN_CODE_DATABASE[initialPincode];
      setCoords({ lat: match.lat, lng: match.lng });
      setAddressDetails({
        locality: match.locality,
        city: match.city,
        state: match.state,
        pincode: initialPincode,
      });
    }
  }, [initialPincode]);

  // Dynamically load Leaflet and initialize map when open
  useEffect(() => {
    if (!isOpen) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initLeafletMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([coords.lat, coords.lng], 15);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Triven Royal Sapphire & Gold Delivery Pin
      const pinIcon = window.L.divIcon({
        className: 'custom-triven-pin',
        html: `
          <div style="position:relative; width:40px; height:48px; transform:translate(-20px, -44px); cursor:pointer;">
            <div style="background:#0F1D36; border:3px solid #D4AF37; width:40px; height:40px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(15,29,54,0.35);">
              <svg style="transform:rotate(45deg); width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style="width:14px; height:6px; background:rgba(0,0,0,0.3); border-radius:50%; margin:2px auto 0 auto; filter:blur(1px);"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 44],
      });

      const marker = window.L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        handlePositionChange(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);

      // Leaflet size invalidate after animation
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initLeafletMap;
      document.body.appendChild(script);
    } else {
      initLeafletMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle position changes and reverse geocode
  const handlePositionChange = async (lat, lng) => {
    setCoords({ lat, lng });

    // Reverse geocode via Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        setAddressDetails({
          locality: addr.road || addr.suburb || addr.neighbourhood || addr.village || 'Pinned Location',
          city: addr.city || addr.town || addr.county || addressDetails.city,
          state: addr.state || addressDetails.state,
          pincode: addr.postcode || addressDetails.pincode,
        });
      }
    } catch (e) {
      // Fallback: keep previous or PIN code data
    }
  };

  // Locate user with device GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        handlePositionChange(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        alert('Could not retrieve current location. Please select on the map manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search locality or PIN code
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    try {
      // Check database first
      if (PIN_CODE_DATABASE[query]) {
        const match = PIN_CODE_DATABASE[query];
        setCoords({ lat: match.lat, lng: match.lng });
        setAddressDetails({
          locality: match.locality,
          city: match.city,
          state: match.state,
          pincode: query,
        });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([match.lat, match.lng], 16);
          markerRef.current.setLatLng([match.lat, match.lng]);
        }
        return;
      }

      // Query OpenStreetMap geocoding
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + ', India'
        )}&format=json&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords({ lat, lng: lon });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }
        handlePositionChange(lat, lon);
      } else {
        alert(`Location "${query}" not found. You can drag the pin on the map directly.`);
      }
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setSearching(false);
    }
  };

  // Zoom controls
  const handleZoom = (delta) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const handleConfirm = () => {
    if (onLocationSelect) {
      onLocationSelect({
        lat: coords.lat,
        lng: coords.lng,
        locality: addressDetails.locality,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
        coordinates: { lat: coords.lat, lng: coords.lng },
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Luxury Map Header */}
        <div className="bg-[#0F1D36] text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0F1D36] flex items-center justify-center font-bold shadow-sm">
              <MapPin className="w-4 h-4 fill-current text-[#0F1D36]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Pin Your Delivery Location
              </h3>
              <p className="text-[11px] text-stone-300">
                Drag marker or click map to confirm your doorstep / apartment gate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#162238] text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & GPS Tool Bar */}
        <div className="p-3 bg-[#FAF8F5] border-b border-[#EBE6DD] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 text-xs">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 min-w-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search area, landmark, or 6-digit PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A059] min-h-[40px]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 flex items-center gap-1 min-h-[40px] shadow-xs"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" /> : <span>Search</span>}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-stone-300 hover:border-[#C5A059] text-stone-700 font-semibold px-3 py-2 rounded-lg shadow-2xs hover:bg-stone-50 transition-colors shrink-0 min-h-[40px]"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-[#8C5E3C]" />
            )}
            <span>Use My Location</span>
          </button>
        </div>

        {/* Interactive Map Area */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] bg-stone-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[280px] sm:min-h-[340px]" />

          {/* Floating Map Zoom Buttons */}
          <div className="absolute right-3 bottom-14 flex flex-col gap-1 z-[1000]">
            <button
              type="button"
              onClick={() => handleZoom(1)}
              className="w-9 h-9 rounded-lg bg-white border border-stone-300 shadow-md flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50"
              title="Zoom In"
              aria-label="Zoom in on map"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-1)}
              className="w-9 h-9 rounded-lg bg-white border border-stone-300 shadow-md flex items-center justify-center font-bold text-stone-700 hover:bg-stone-50"
              title="Zoom Out"
              aria-label="Zoom out on map"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Pin Instruction Pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-stone-300 px-3 py-1 rounded-full shadow-md text-[10px] sm:text-[11px] font-semibold text-stone-800 flex items-center gap-1.5 z-[1000] pointer-events-none max-w-[90%] text-center">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse shrink-0"></span>
            <span className="truncate">Drag pin or tap map to pinpoint exact gate</span>
          </div>
        </div>

        {/* Bottom Location Confirmation Summary */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <CheckCircle2 className="w-4 h-4 text-[#8C5E3C] shrink-0" />
                <span className="truncate">Selected Delivery Pin Location</span>
              </div>
              <p className="text-xs font-medium text-stone-900 truncate">
                {addressDetails.locality}, {addressDetails.city}, {addressDetails.state} -{' '}
                <strong className="text-stone-900 font-bold">{addressDetails.pincode}</strong>
              </p>
              <p className="text-[10px] text-stone-500">
                GPS: {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-none bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border border-[#D4AF37]/40 min-h-[44px] active:scale-98"
              >
                <span>Confirm Pin</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
