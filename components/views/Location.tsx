'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { type FamilyMember, useTodoStore } from '@/lib/store/todoStore';
import './Location.scss';

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const REQUIRED_GPS_ACCURACY_METERS = 1;

const isValidCoordinate = (value: number) => Number.isFinite(value);

const clampLatitude = (latitude: number) => Math.max(-85, Math.min(85, latitude));

const formatCoordinate = (value: number) => value.toFixed(5);

const formatAccuracy = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Unknown accuracy';
  return value < 10 ? `${value.toFixed(1)} m accuracy` : `${Math.round(value)} m accuracy`;
};

const buildBounds = (members: FamilyMember[]): MapBounds => {
  if (members.length === 0) {
    return {
      minLat: 59.88,
      maxLat: 59.95,
      minLon: 10.68,
      maxLon: 10.82,
    };
  }

  const latitudes = members.map((member) => member.latitude).filter(isValidCoordinate);
  const longitudes = members.map((member) => member.longitude).filter(isValidCoordinate);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latPadding = Math.max((maxLat - minLat) * 0.3, 0.015);
  const lonPadding = Math.max((maxLon - minLon) * 0.3, 0.02);

  return {
    minLat: clampLatitude(minLat - latPadding),
    maxLat: clampLatitude(maxLat + latPadding),
    minLon: minLon - lonPadding,
    maxLon: maxLon + lonPadding,
  };
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char];
  });

const gpsUnavailableMessage = () =>
  window.isSecureContext
    ? 'GPS is not available in this browser.'
    : 'GPS needs localhost or HTTPS to work in the browser.';

const isPreciseEnough = (accuracy: number) =>
  Number.isFinite(accuracy) && accuracy <= REQUIRED_GPS_ACCURACY_METERS;

export default function Location() {
  const { state, updateMemberLocation } = useTodoStore();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());
  const hasFittedMapRef = useRef(false);
  const fittedMemberCountRef = useRef(0);
  const watchIdRef = useRef<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [memberId, setMemberId] = useState(state.members[0]?.id || '');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationError, setLocationError] = useState('');
  const [liveMemberId, setLiveMemberId] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState('');

  const selectedMember = state.members.find((member) => member.id === memberId) || state.members[0];
  const mappableMembers = useMemo(
    () =>
      state.members.filter(
        (member) => isValidCoordinate(member.latitude) && isValidCoordinate(member.longitude)
      ),
    [state.members]
  );

  const bounds = useMemo(() => buildBounds(mappableMembers), [mappableMembers]);
  const center = useMemo(
    () => ({
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      longitude: (bounds.minLon + bounds.maxLon) / 2,
    }),
    [bounds]
  );
  const initialMapCenterRef = useRef(center);
  const initialMapZoomRef = useRef(mapZoom);
  const openMapUrl = `https://www.openstreetmap.org/#map=${mapZoom}/${center.latitude}/${center.longitude}`;
  const selectedMemberId = selectedMember?.id;
  const selectedMemberLatitude = selectedMember?.latitude;
  const selectedMemberLongitude = selectedMember?.longitude;

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;
    let cancelled = false;
    const currentMarkers = markerRefs.current;

    const setupMap = async () => {
      const L = await import('leaflet');
      if (cancelled || leafletMapRef.current) return;

      const map = L.map(mapElement, {
        center: [initialMapCenterRef.current.latitude, initialMapCenterRef.current.longitude],
        zoom: initialMapZoomRef.current,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('zoomend', () => setMapZoom(map.getZoom()));
      leafletMapRef.current = map;
      setMapReady(true);

      window.setTimeout(() => map.invalidateSize(), 0);
    };

    setupMap();

    const resizeObserver = new ResizeObserver(() => {
      leafletMapRef.current?.invalidateSize();
    });
    resizeObserver.observe(mapElement);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      currentMarkers.forEach((marker) => marker.remove());
      currentMarkers.clear();
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!mapReady || !map) return;

    let cancelled = false;

    const updateMarkers = async () => {
      const L = await import('leaflet');
      if (cancelled) return;

      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current.clear();

      mappableMembers.forEach((member) => {
        const icon = L.divIcon({
          className: `family-map-marker-icon ${member.id === memberId ? 'selected' : ''}`,
          html: `<span>${escapeHtml(member.avatar)}</span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 42],
          popupAnchor: [0, -42],
        });
        const marker = L.marker([member.latitude, member.longitude], {
          icon,
          title: member.name,
        })
          .addTo(map)
          .bindTooltip(`${member.name}: ${member.locationLabel}`);

        marker.on('click', () => setMemberId(member.id));
        marker.getElement()?.style.setProperty('--member-color', member.color);
        markerRefs.current.set(member.id, marker);
      });
    };

    updateMarkers();

    return () => {
      cancelled = true;
    };
  }, [mapReady, mappableMembers, memberId]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!mapReady || !map || mappableMembers.length === 0) return;

    if (hasFittedMapRef.current && fittedMemberCountRef.current === mappableMembers.length) {
      return;
    }

    const coordinates = mappableMembers.map((member) => [member.latitude, member.longitude] as [number, number]);
    map.fitBounds(coordinates, {
      padding: [40, 40],
      maxZoom: 15,
      animate: false,
    });
    hasFittedMapRef.current = true;
    fittedMemberCountRef.current = mappableMembers.length;
  }, [mapReady, mappableMembers]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!mapReady || !map || !selectedMemberId) return;
    if (selectedMemberLatitude === undefined || selectedMemberLongitude === undefined) return;
    if (!isValidCoordinate(selectedMemberLatitude) || !isValidCoordinate(selectedMemberLongitude)) return;

    map.panTo([selectedMemberLatitude, selectedMemberLongitude], { animate: false });
  }, [mapReady, selectedMemberId, selectedMemberLatitude, selectedMemberLongitude]);

  useEffect(() => {
    if (!memberId && state.members[0]) {
      setMemberId(state.members[0].id);
    }
  }, [memberId, state.members]);

  useEffect(() => {
    if (!selectedMember) return;
    setLocationLabel(selectedMember.locationLabel);
  }, [selectedMember]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const stopLiveGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLiveMemberId(null);
    setGpsStatus('Live GPS stopped.');
  };

  const updateLocation = (event: React.FormEvent) => {
    event.preventDefault();
    updateMemberLocation(memberId, locationLabel.trim());
    setLocationError('');
  };

  const useCurrentGps = () => {
    if (!navigator.geolocation) {
      setLocationError(gpsUnavailableMessage());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const nextLabel = locationLabel.trim() || 'Current GPS location';

        if (!isPreciseEnough(accuracy)) {
          setGpsStatus(`Current GPS reading is ${formatAccuracy(accuracy)}.`);
          setLocationError('Waiting for 1.0 m accuracy before saving this location.');
          return;
        }

        setLocationLabel(nextLabel);
        updateMemberLocation(memberId, nextLabel, nextLatitude, nextLongitude, accuracy);
        setGpsStatus(`Saved GPS position with ${formatAccuracy(accuracy)}.`);
        setLocationError('');
      },
      () => setLocationError('Could not read GPS location. Check browser permissions.'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
  };

  const startLiveGps = () => {
    if (!navigator.geolocation) {
      setLocationError(gpsUnavailableMessage());
      return;
    }

    if (!selectedMember) {
      setLocationError('Choose a family member before starting live GPS.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const trackedMemberId = selectedMember.id;
    const trackedMemberName = selectedMember.name;
    const nextLabel = locationLabel.trim() || `${trackedMemberName} live GPS`;

    setLocationError('');
    setGpsStatus(`Starting live GPS for ${trackedMemberName}...`);
    setLiveMemberId(trackedMemberId);
    setLocationLabel(nextLabel);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (!isPreciseEnough(accuracy)) {
          setGpsStatus(`Waiting for 1.0 m accuracy. Current reading is ${formatAccuracy(accuracy)}.`);
          return;
        }

        updateMemberLocation(trackedMemberId, nextLabel, nextLatitude, nextLongitude, accuracy);
        setGpsStatus(`Live GPS saved with ${formatAccuracy(accuracy)}.`);
        setLocationError('');
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not keep live GPS running.';
        setLocationError(message);
        setGpsStatus('Live GPS stopped.');
        setLiveMemberId(null);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      }
    );
  };

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat('nb-NO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <div className="location-view">
      <div className="location-header">
        <h2>Location</h2>
        <p className="subtitle">Live GPS map for family members</p>
      </div>

      <section className="location-map-section">
        <div className="map-shell" ref={mapRef}>
          {!mapReady && <div className="map-loading">Loading map...</div>}
        </div>

        <aside className="map-details">
          <h3>GPS positions</h3>
          <div className="location-list">
            {state.members.map((member) => (
              <button
                type="button"
                className={`location-person ${member.id === memberId ? 'selected' : ''}`}
                key={member.id}
                onClick={() => setMemberId(member.id)}
              >
                <span className="member-avatar" style={{ backgroundColor: member.color }}>
                  {member.avatar}
                </span>
                <span>
                  <strong>{member.name}</strong>
                  <small>{member.locationLabel}</small>
                  <small>
                    {formatCoordinate(member.latitude)}, {formatCoordinate(member.longitude)}
                  </small>
                  <small>{formatAccuracy(member.locationAccuracyMeters)}</small>
                </span>
              </button>
            ))}
          </div>
          <a href={openMapUrl} target="_blank" rel="noreferrer" className="open-map-link">
            Open full map
          </a>
          <p className="map-note">
            Live GPS tracks this device for the selected member.
          </p>
        </aside>
      </section>

      <div className="location-grid">
        {state.members.map((member) => (
          <article className="location-card" key={member.id}>
            <div className="member-avatar" style={{ backgroundColor: member.color }}>
              {member.avatar}
            </div>
            <div>
              <h3>{member.name}</h3>
              <p>{member.locationLabel}</p>
              <span>{formatTime(member.locationUpdatedAt)}</span>
              <span>{formatAccuracy(member.locationAccuracyMeters)}</span>
            </div>
          </article>
        ))}
      </div>

      <form className="location-form" onSubmit={updateLocation}>
        <div className="form-row">
          <label>
            Member
            <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Label
            <input
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              placeholder="Home, school, work..."
              required
            />
          </label>
        </div>

        <div className="form-row coordinate-row">
          <div className="coordinate-display">
            <span>Coordinates</span>
            <strong>
              {selectedMember
                ? `${formatCoordinate(selectedMember.latitude)}, ${formatCoordinate(selectedMember.longitude)}`
                : 'No GPS position'}
            </strong>
            <small>{selectedMember ? formatAccuracy(selectedMember.locationAccuracyMeters) : ''}</small>
          </div>
          <button type="button" className="secondary-button" onClick={useCurrentGps}>
            Update once
          </button>
          {liveMemberId === memberId ? (
            <button type="button" className="danger-button" onClick={stopLiveGps}>
              Stop live GPS
            </button>
          ) : (
            <button type="button" className="live-button" onClick={startLiveGps}>
              Start live GPS
            </button>
          )}
          <button type="submit">Update</button>
        </div>

        {gpsStatus && <p className="gps-status">{gpsStatus}</p>}
        {locationError && <p className="location-error">{locationError}</p>}
      </form>
    </div>
  );
}
