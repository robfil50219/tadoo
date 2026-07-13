'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Circle as LeafletCircle, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { useTodoStore } from '@/lib/store/todoStore';
import type { FamilyMember } from '../family.types';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { memberColorClassName } from '@/lib/memberColors';
import './Location.scss';

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

interface PendingGpsPosition {
  memberId: string;
  label: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  receivedAt: number;
}

interface PersistedGpsPosition {
  memberId: string;
  latitude: number;
  longitude: number;
  persistedAt: number;
}

const REQUIRED_GPS_ACCURACY_METERS = 1;
const MAX_LIVE_GPS_ACCURACY_METERS = 100;
const LIVE_GPS_MIN_DISTANCE_METERS = 30;
const LIVE_GPS_MAX_INTERVAL_MS = 20_000;
const EARTH_RADIUS_METERS = 6_371_000;

const isValidCoordinate = (value: number) => Number.isFinite(value);

const clampLatitude = (latitude: number) => Math.max(-85, Math.min(85, latitude));

const formatCoordinate = (value: number) => value.toFixed(5);

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInMeters = (
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) => {
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
};

type Translate = (key: string, replacements?: Record<string, string | number>) => string;

const formatAccuracy = (value: number | undefined, t: Translate) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return t('location.unknownAccuracy');
  return t('location.meterAccuracy', {
    value: value < 10 ? value.toFixed(1) : Math.round(value),
  });
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

const gpsUnavailableMessage = (t: Translate) =>
  window.isSecureContext
    ? t('location.gpsUnavailable')
    : t('location.gpsNeedsSecureContext');

const isPreciseEnough = (accuracy: number) =>
  Number.isFinite(accuracy) && accuracy <= REQUIRED_GPS_ACCURACY_METERS;

type MeasuredGpsMember = FamilyMember & { locationAccuracyMeters: number };

const hasMapPosition = (member?: FamilyMember): member is FamilyMember =>
  Boolean(
    member &&
      isValidCoordinate(member.latitude) &&
      isValidCoordinate(member.longitude)
  );

const hasMeasuredGps = (member?: FamilyMember): member is MeasuredGpsMember =>
  Boolean(
    hasMapPosition(member) &&
      typeof member.locationAccuracyMeters === 'number' &&
      Number.isFinite(member.locationAccuracyMeters)
  );

const hasVerifiedGps = (member?: FamilyMember) =>
  hasMeasuredGps(member) && isPreciseEnough(member.locationAccuracyMeters);

const formatGpsPosition = (member: FamilyMember | undefined, t: Translate) =>
  hasMeasuredGps(member)
    ? `${formatCoordinate(member.latitude)}, ${formatCoordinate(member.longitude)}`
    : hasMapPosition(member)
      ? `${formatCoordinate(member.latitude)}, ${formatCoordinate(member.longitude)}`
      : t('location.noPositionYet');

const formatGpsAccuracy = (member: FamilyMember | undefined, t: Translate) => {
  if (!member) return '';
  if (!hasMapPosition(member)) return t('location.noPositionSaved');
  if (!hasMeasuredGps(member)) return t('location.savedPlace');
  if (hasVerifiedGps(member)) return t('location.verified', {
    accuracy: formatAccuracy(member.locationAccuracyMeters, t),
  });
  return t('location.needsOneMeter', {
    accuracy: formatAccuracy(member.locationAccuracyMeters, t),
  });
};

export default function Location() {
  const { state, updateMemberLocation } = useTodoStore();
  const { locale, t } = useLanguage();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());
  const circleRefs = useRef<Map<string, LeafletCircle>>(new Map());
  const hasFittedMapRef = useRef(false);
  const fittedMemberCountRef = useRef(0);
  const watchIdRef = useRef<number | null>(null);
  const pendingPersistTimerRef = useRef<number | null>(null);
  const pendingGpsPositionRef = useRef<PendingGpsPosition | null>(null);
  const lastPersistedGpsPositionRef = useRef<PersistedGpsPosition | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [memberId, setMemberId] = useState(state.members[0]?.id || '');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationError, setLocationError] = useState('');
  const [liveMemberId, setLiveMemberId] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState('');

  const selectedMember = state.members.find((member) => member.id === memberId) || state.members[0];
  const mappableMembers = useMemo(
    () => state.members.filter(hasMapPosition),
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
  const selectedMemberHasMapPosition = hasMapPosition(selectedMember);

  const clearPendingPersistTimer = () => {
    if (pendingPersistTimerRef.current !== null) {
      window.clearTimeout(pendingPersistTimerRef.current);
      pendingPersistTimerRef.current = null;
    }
  };

  const resetLiveGpsPersistence = () => {
    clearPendingPersistTimer();
    pendingGpsPositionRef.current = null;
    lastPersistedGpsPositionRef.current = null;
  };

  const persistLiveGpsPosition = (position: PendingGpsPosition) => {
    updateMemberLocation(
      position.memberId,
      position.label,
      position.latitude,
      position.longitude,
      position.accuracy
    );

    lastPersistedGpsPositionRef.current = {
      memberId: position.memberId,
      latitude: position.latitude,
      longitude: position.longitude,
      persistedAt: Date.now(),
    };
    pendingGpsPositionRef.current = null;
    clearPendingPersistTimer();
  };

  const schedulePendingGpsPersist = () => {
    const lastPersisted = lastPersistedGpsPositionRef.current;
    if (!lastPersisted || pendingPersistTimerRef.current !== null) return;

    const elapsed = Date.now() - lastPersisted.persistedAt;
    const delay = Math.max(0, LIVE_GPS_MAX_INTERVAL_MS - elapsed);

    pendingPersistTimerRef.current = window.setTimeout(() => {
      pendingPersistTimerRef.current = null;
      const pending = pendingGpsPositionRef.current;
      const currentLastPersisted = lastPersistedGpsPositionRef.current;

      if (!pending || !currentLastPersisted) return;
      if (pending.memberId !== currentLastPersisted.memberId) return;

      persistLiveGpsPosition(pending);
    }, delay);
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;
    let cancelled = false;
    const currentMarkers = markerRefs.current;
    const currentCircles = circleRefs.current;

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
      currentCircles.forEach((circle) => circle.remove());
      currentCircles.clear();
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
      circleRefs.current.forEach((circle) => circle.remove());
      circleRefs.current.clear();

      mappableMembers.forEach((member) => {
        const isVerified = hasVerifiedGps(member);
        const isMeasured = hasMeasuredGps(member);
        if (isMeasured) {
          const circle = L.circle([member.latitude, member.longitude], {
            radius: Math.max(member.locationAccuracyMeters, REQUIRED_GPS_ACCURACY_METERS),
            color: member.color,
            fillColor: member.color,
            fillOpacity: isVerified ? 0.08 : 0.13,
            opacity: isVerified ? 0.45 : 0.7,
            weight: isVerified ? 1 : 2,
            dashArray: isVerified ? undefined : '5 5',
          }).addTo(map);
          circleRefs.current.set(member.id, circle);
        }
        const icon = L.divIcon({
          className: `family-map-marker-icon ${member.id === memberId ? 'selected' : ''} ${
            isVerified ? 'verified' : isMeasured ? 'estimated' : 'saved'
          } ${memberColorClassName(member.color)}`,
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
          .bindTooltip(`${member.name}: ${member.locationLabel} (${formatGpsAccuracy(member, t)})`);

        marker.on('click', () => setMemberId(member.id));
        markerRefs.current.set(member.id, marker);
      });
    };

    updateMarkers();

    return () => {
      cancelled = true;
    };
  }, [mapReady, mappableMembers, memberId, t]);

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
    if (!selectedMemberHasMapPosition) return;
    if (selectedMemberLatitude === undefined || selectedMemberLongitude === undefined) return;
    if (!isValidCoordinate(selectedMemberLatitude) || !isValidCoordinate(selectedMemberLongitude)) return;

    map.panTo([selectedMemberLatitude, selectedMemberLongitude], { animate: false });
  }, [
    mapReady,
    selectedMemberId,
    selectedMemberLatitude,
    selectedMemberLongitude,
    selectedMemberHasMapPosition,
  ]);

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
      clearPendingPersistTimer();
      pendingGpsPositionRef.current = null;
      lastPersistedGpsPositionRef.current = null;
    };
  }, []);

  const stopLiveGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    resetLiveGpsPersistence();
    setLiveMemberId(null);
    setGpsStatus(t('location.liveGpsStopped'));
  };

  const updateLocation = (event: React.FormEvent) => {
    event.preventDefault();
    updateMemberLocation(memberId, locationLabel.trim());
    setLocationError('');
  };

  const useCurrentGps = () => {
    if (!navigator.geolocation) {
      setLocationError(gpsUnavailableMessage(t));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const nextLabel = locationLabel.trim() || t('location.currentGpsLocation');

        setLocationLabel(nextLabel);
        updateMemberLocation(memberId, nextLabel, nextLatitude, nextLongitude, accuracy);
        setGpsStatus(
          isPreciseEnough(accuracy)
            ? t('location.savedVerifiedGps', { accuracy: formatAccuracy(accuracy, t) })
            : t('location.savedEstimatedGps', { accuracy: formatAccuracy(accuracy, t) })
        );
        setLocationError('');
      },
      () => setLocationError(t('location.gpsReadError')),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
  };

  const startLiveGps = () => {
    if (!navigator.geolocation) {
      setLocationError(gpsUnavailableMessage(t));
      return;
    }

    if (!selectedMember) {
      setLocationError(t('location.chooseMemberForGps'));
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    resetLiveGpsPersistence();

    const trackedMemberId = selectedMember.id;
    const trackedMemberName = selectedMember.name;
    const nextLabel = locationLabel.trim() || t('location.liveGpsLabel', { name: trackedMemberName });

    setLocationError('');
    setGpsStatus(t('location.startingLiveGps', { name: trackedMemberName }));
    setLiveMemberId(trackedMemberId);
    setLocationLabel(nextLabel);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (!isValidCoordinate(nextLatitude) || !isValidCoordinate(nextLongitude)) {
          return;
        }

        const lastPersisted = lastPersistedGpsPositionRef.current;
        const hasPreviousPersistedPosition =
          lastPersisted?.memberId === trackedMemberId;

        if (
          hasPreviousPersistedPosition &&
          (!Number.isFinite(accuracy) || accuracy > MAX_LIVE_GPS_ACCURACY_METERS)
        ) {
          setGpsStatus(
            t('location.liveGpsUpdated', { accuracy: formatAccuracy(accuracy, t) })
          );
          setLocationError('');
          return;
        }

        const pendingPosition: PendingGpsPosition = {
          memberId: trackedMemberId,
          label: nextLabel,
          latitude: nextLatitude,
          longitude: nextLongitude,
          accuracy,
          receivedAt: Date.now(),
        };

        pendingGpsPositionRef.current = pendingPosition;

        if (!hasPreviousPersistedPosition || !lastPersisted) {
          persistLiveGpsPosition(pendingPosition);
        } else {
          const movedDistance = distanceInMeters(
            lastPersisted.latitude,
            lastPersisted.longitude,
            nextLatitude,
            nextLongitude
          );
          const elapsed = Date.now() - lastPersisted.persistedAt;

          if (
            movedDistance >= LIVE_GPS_MIN_DISTANCE_METERS ||
            elapsed >= LIVE_GPS_MAX_INTERVAL_MS
          ) {
            persistLiveGpsPosition(pendingPosition);
          } else {
            schedulePendingGpsPersist();
          }
        }

        setGpsStatus(
          isPreciseEnough(accuracy)
            ? t('location.liveGpsVerified', { accuracy: formatAccuracy(accuracy, t) })
            : t('location.liveGpsUpdated', { accuracy: formatAccuracy(accuracy, t) })
        );
        setLocationError('');
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? t('location.permissionDenied')
            : t('location.liveGpsError');
        setLocationError(message);
        setGpsStatus(t('location.liveGpsStopped'));
        setLiveMemberId(null);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        resetLiveGpsPersistence();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      }
    );
  };

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <div className="location-view">
      <div className="location-header">
        <h2>{t('location.title')}</h2>
        <p className="subtitle">{t('location.subtitle')}</p>
      </div>

      <section className="location-map-section">
        <div className="map-shell" ref={mapRef}>
          {!mapReady && <div className="map-loading">{t('location.loadingMap')}</div>}
          {mapReady && mappableMembers.length === 0 && (
            <div className="map-empty-state">{t('location.noMapPositions')}</div>
          )}
        </div>

        <aside className="map-details">
          <h3>{t('location.mapPositions')}</h3>
          <div className="location-list">
            {state.members.map((member) => (
              <button
                type="button"
                className={`location-person ${member.id === memberId ? 'selected' : ''}`}
                key={member.id}
                onClick={() => setMemberId(member.id)}
              >
                <span className={`member-avatar ${memberColorClassName(member.color)}`}>
                  {member.avatar}
                </span>
                <span>
                  <strong>{member.name}</strong>
                  <small>{member.locationLabel}</small>
                  <small>{formatGpsPosition(member, t)}</small>
                  <small>{formatGpsAccuracy(member, t)}</small>
                </span>
              </button>
            ))}
          </div>
          <a href={openMapUrl} target="_blank" rel="noreferrer" className="open-map-link">
            {t('location.openFullMap')}
          </a>
          <p className="map-note">
            {t('location.mapNote')}
          </p>
        </aside>
      </section>

      <div className="location-grid">
        {state.members.map((member) => (
          <article className="location-card" key={member.id}>
            <div className={`member-avatar ${memberColorClassName(member.color)}`}>
              {member.avatar}
            </div>
            <div>
              <h3>{member.name}</h3>
              <p>{member.locationLabel}</p>
              <span>{formatTime(member.locationUpdatedAt)}</span>
              <span>{formatGpsAccuracy(member, t)}</span>
            </div>
          </article>
        ))}
      </div>

      <form className="location-form" onSubmit={updateLocation}>
        <div className="form-row">
          <label>
            {t('location.member')}
            <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('location.label')}
            <input
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              placeholder={t('location.labelPlaceholder')}
              required
            />
          </label>
        </div>

        <div className="form-row coordinate-row">
          <div className="coordinate-display">
            <span>{t('location.coordinates')}</span>
            <strong>{formatGpsPosition(selectedMember, t)}</strong>
            <small>{formatGpsAccuracy(selectedMember, t)}</small>
          </div>
          <button type="button" className="secondary-button" onClick={useCurrentGps}>
            {t('location.updateOnce')}
          </button>
          {liveMemberId === memberId ? (
            <button type="button" className="danger-button" onClick={stopLiveGps}>
              {t('location.stopLiveGps')}
            </button>
          ) : (
            <button type="button" className="live-button" onClick={startLiveGps}>
              {t('location.startLiveGps')}
            </button>
          )}
          <button type="submit">{t('location.update')}</button>
        </div>

        {gpsStatus && <p className="gps-status">{gpsStatus}</p>}
        {locationError && <p className="location-error">{locationError}</p>}
      </form>
    </div>
  );
}