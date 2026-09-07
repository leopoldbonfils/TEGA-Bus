import React, { useCallback, useMemo, useRef, useState } from 'react';
import {StyleSheet, Text, View,TouchableOpacity, ActivityIndicator, Alert,} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons,} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BACKEND_URL } from '../constants/config';
import { ROUTE_WAYPOINTS, Coordinate } from '../constants/routeWaypoints';

interface Telemetry {
  busNumber: string;
  routeNumber: string;
  speed: number;
  heading: number;
  etaMinutes: number;
  currentStop: string;
  nextStop: string;
  distanceToNextStopKm: number;
  isMoving: boolean;
  motionStatus: 'MOVING' | 'PARKED';
}

const DEFAULT_ROUTE_STOPS: Record<string, { name: string; latitude: number; longitude: number; labelSide?: 'left' | 'right' }[]> = {
  '101': [
    { name: 'Downtown (Kigali City)', latitude: -1.9500, longitude: 30.0580, labelSide: 'right' },
    { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, labelSide: 'left' },
    { name: 'Rwandex', latitude: -1.9480, longitude: 30.0500, labelSide: 'right' },
    { name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, labelSide: 'right' },
    { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, labelSide: 'left' },
  ],
  '202': [
    { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, labelSide: 'right' },
    { name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, labelSide: 'right' },
    { name: 'Remera', latitude: -1.9502, longitude: 30.1073, labelSide: 'left' },
    { name: 'Kimironko Terminus', latitude: -1.9400, longitude: 30.1200, labelSide: 'right' },
  ],
  '109': [
    { name: 'Nyabugogo Bus Park', latitude: -1.9355, longitude: 30.0540, labelSide: 'right' },
    { name: 'Kinamba Bridge', latitude: -1.9392, longitude: 30.0612, labelSide: 'left' },
    { name: 'Rwandex', latitude: -1.9567, longitude: 30.0815, labelSide: 'right' },
    { name: 'Sonatubes', latitude: -1.9612, longitude: 30.0965, labelSide: 'left' },
    { name: 'Remera Bus Park', latitude: -1.9502, longitude: 30.1073, labelSide: 'right' },
  ],
  '203': [
    { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, labelSide: 'right' },
    { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, labelSide: 'left' },
    { name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, labelSide: 'right' },
    { name: 'Remera Bus Park', latitude: -1.9502, longitude: 30.1073, labelSide: 'left' },
  ],
  '204': [
    { name: 'Kimironko Terminus', latitude: -1.9400, longitude: 30.1200, labelSide: 'right' },
    { name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, labelSide: 'left' },
    { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, labelSide: 'right' },
    { name: 'Downtown (Kigali City)', latitude: -1.9500, longitude: 30.0580, labelSide: 'left' },
  ],
  '303': [
    { name: 'Nyabugogo Terminal', latitude: -1.9355, longitude: 30.0540, labelSide: 'right' },
    { name: 'Gatsata', latitude: -1.9220, longitude: 30.0515, labelSide: 'left' },
    { name: 'Karuruma', latitude: -1.8965, longitude: 30.0570, labelSide: 'right' },
    { name: 'Nyacyonga', latitude: -1.8682, longitude: 30.0847, labelSide: 'left' },
  ],
  '304': [
    { name: 'Nyacyonga', latitude: -1.8682, longitude: 30.0847, labelSide: 'right' },
    { name: 'Karuruma', latitude: -1.8965, longitude: 30.0570, labelSide: 'left' },
    { name: 'Gatsata', latitude: -1.9220, longitude: 30.0515, labelSide: 'right' },
    { name: 'Nyabugogo Terminal', latitude: -1.9355, longitude: 30.0540, labelSide: 'left' },
  ],
  '305': [
    { name: 'Nyabugogo Terminal', latitude: -1.9355, longitude: 30.0540, labelSide: 'right' },
    { name: 'Gisozi', latitude: -1.9315, longitude: 30.0645, labelSide: 'left' },
    { name: 'Kagugu', latitude: -1.9180, longitude: 30.0785, labelSide: 'right' },
    { name: 'Batsinda', latitude: -1.8985, longitude: 30.0818, labelSide: 'left' },
    { name: 'Nyacyonga', latitude: -1.8682, longitude: 30.0847, labelSide: 'right' },
  ],
};

const buildSingleBusMapHtml = (
  backendUrl: string,
  routeNumber: string,
  busNumber: string,
  waypoints: Coordinate[],
  userLat: number,
  userLng: number,
): string => {
  const waypointsJson = JSON.stringify(waypoints);
  const stops = DEFAULT_ROUTE_STOPS[routeNumber] || DEFAULT_ROUTE_STOPS['202'];
  const stopsJson = JSON.stringify(stops);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif}
    #map{width:100vw;height:100vh}

    .leaflet-control-attribution{font-size:8px!important;background:rgba(255,255,255,0.7)!important;padding:2px 4px!important;border-radius:3px!important}

    /* User 'You are here' Marker */
    .user-marker-wrap{position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center}
    .user-dot-pulse{position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(37,99,235,0.22);animation:userPulse 2s infinite}
    @keyframes userPulse{0%{transform:scale(0.6);opacity:0.9}100%{transform:scale(2.2);opacity:0}}
    .user-dot-core{position:relative;z-index:2;width:14px;height:14px;border-radius:50%;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(37,99,235,0.4)}
    .user-callout{position:absolute;top:32px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:11px;font-weight:700;color:#334155;pointer-events:none}

    /* Stop Marker & Permanent White Callout Pill */
    .stop-marker-wrap{position:relative;display:flex;align-items:center;justify-content:center}
    .stop-dot{width:12px;height:12px;border-radius:50%;background:#FFFFFF;border:3px solid #04325E;box-shadow:0 1px 4px rgba(0,0,0,0.25)}
    .stop-label-pill{position:absolute;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:4px 9px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.08);font-size:11px;font-weight:800;color:#04325E;pointer-events:none}
    .stop-label-right{left:18px;top:-8px}
    .stop-label-left{right:18px;top:-8px}

    /* Single Bus Vehicle & Badge */
    .bus-marker-wrap{position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center}
    .bus-vehicle{width:24px;height:46px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));transition:transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)}
    .bus-badge-pill{position:absolute;top:-18px;background:#04325E;border:1.5px solid #FFFFFF;border-radius:8px;padding:2px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(4,50,94,0.35);font-size:10.5px;font-weight:900;color:#FFFFFF;display:flex;align-items:center;gap:4px;letter-spacing:0.3px}
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <script>
    var BACKEND_URL = '${backendUrl}';
    var TARGET_BUS = '${busNumber}';
    var TARGET_ROUTE = '${routeNumber}';
    var USER_LAT = ${userLat};
    var USER_LNG = ${userLng};
    var ROUTE_WAYPOINTS = ${waypointsJson};
    var STOPS = ${stopsJson};

    var isFollowing = false;
    var currentTileIndex = 0;
    var busMarker = null;
    var currentBusHeading = 0;
    var busLatLng = null;
    var routePoly = null;
    var casingPoly = null;

    var map = L.map('map', {
      center: [USER_LAT, USER_LNG],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true
    });

    var tileLayers = [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }),
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© CartoDB' })
    ];
    tileLayers[0].addTo(map);

    // 1. Draw Passenger 'You are here' Pin
    var userIcon = L.divIcon({
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: '<div class="user-marker-wrap"><div class="user-dot-pulse"></div><div class="user-dot-core"></div><div class="user-callout">You are here</div></div>'
    });
    L.marker([USER_LAT, USER_LNG], { icon: userIcon, zIndexOffset: 800 }).addTo(map);

    // 2. Draw Target Route Line
    var latLngs = [];
    if (ROUTE_WAYPOINTS && ROUTE_WAYPOINTS.length >= 2) {
      latLngs = ROUTE_WAYPOINTS.map(function(w) { return [w.latitude, w.longitude]; });
    } else if (STOPS && STOPS.length >= 2) {
      latLngs = STOPS.map(function(s) { return [s.latitude, s.longitude]; });
    }

    if (latLngs && latLngs.length >= 2) {
      // Outer route casing (soft blue glow)
      casingPoly = L.polyline(latLngs, {
        color: '#2563EB',
        weight: 8,
        opacity: 0.24,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      }).addTo(map);

      // Main route polyline (vibrant navy blue)
      routePoly = L.polyline(latLngs, {
        color: '#04325E',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

    }

    // 3. Draw Stops with Crisp White Callout Badges
    if (STOPS && STOPS.length > 0) {
      STOPS.forEach(function(s) {
        var labelClass = s.labelSide === 'left' ? 'stop-label-left' : 'stop-label-right';
        var stopIcon = L.divIcon({
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          html: '<div class="stop-marker-wrap"><div class="stop-dot"></div><div class="stop-label-pill ' + labelClass + '">' + s.name + '</div></div>'
        });
        L.marker([s.latitude, s.longitude], { icon: stopIcon, zIndexOffset: 700 }).addTo(map);
      });
    }

    // Bus Top-Down SVG graphic
    function busSvg() {
      return '<svg width="24" height="46" viewBox="0 0 22 42" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="1" y="3" width="20" height="36" rx="4" fill="#04325E" stroke="#FFFFFF" stroke-width="1.5"/>' +
        '<polygon points="11,0 6,6 16,6" fill="#FFFFFF"/>' +
        '<rect x="3" y="4" width="16" height="7" rx="2" fill="#93C5FD" stroke="rgba(255,255,255,0.6)" stroke-width="0.5"/>' +
        '<rect x="1.5" y="13" width="2.5" height="16" rx="1.2" fill="rgba(15,23,42,0.5)"/>' +
        '<rect x="18" y="13" width="2.5" height="16" rx="1.2" fill="rgba(15,23,42,0.5)"/>' +
        '<rect x="3" y="1.5" width="5" height="2" rx="0.8" fill="#FEF08A"/>' +
        '<rect x="14" y="1.5" width="5" height="2" rx="0.8" fill="#FEF08A"/>' +
        '<rect x="3" y="38.5" width="5" height="2" rx="0.8" fill="#EF4444"/>' +
        '<rect x="14" y="38.5" width="5" height="2" rx="0.8" fill="#EF4444"/>' +
        '</svg>';
    }

    function createBusMarker(pos, heading) {
      var icon = L.divIcon({
        className: '',
        iconSize: [56, 56],
        iconAnchor: [28, 28],
        html: '<div class="bus-marker-wrap">' +
          '<div class="bus-badge-pill"> BUS ' + TARGET_BUS + '</div>' +
          '<div class="bus-vehicle" style="transform:rotate(' + heading + 'deg)">' + busSvg() + '</div>' +
          '</div>'
      });
      busMarker = L.marker(pos, { icon: icon, zIndexOffset: 1200 }).addTo(map);
      busLatLng = pos;
    }

    // ── Pre-calculate Route Segments & Cumulative Distances ──────────────────
    function buildRouteSegments(points) {
      var segs = [];
      var total = 0;
      if (!points || points.length < 2) return { segs: segs, total: 0 };

      for (var i = 0; i < points.length - 1; i++) {
        var p1 = points[i];
        var p2 = points[i + 1];

        var midLat = (p1[0] + p2[0]) * 0.5 * Math.PI / 180;
        var cosLat = Math.cos(midLat);
        var dx = (p2[1] - p1[1]) * cosLat * 111320;
        var dy = (p2[0] - p1[0]) * 110574;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var bearing = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;

        segs.push({
          start: p1,
          end: p2,
          distance: dist,
          cumStart: total,
          cumEnd: total + dist,
          bearing: Math.round(bearing),
          dx: dx,
          dy: dy,
          distSq: dx * dx + dy * dy
        });
        total += dist;
      }
      return { segs: segs, total: total };
    }

    var routeData = buildRouteSegments(latLngs);

    // ── Snap coordinate onto Route Polyline (finding cumulative route distance) ──
    function snapPointToRoute(p, segs) {
      if (!segs || segs.length === 0) return 0;
      var bestDistSq = Infinity;
      var bestRouteDist = 0;

      for (var i = 0; i < segs.length; i++) {
        var s = segs[i];
        if (s.distSq < 0.0001) continue;

        var midLat = (s.start[0] + s.end[0]) * 0.5 * Math.PI / 180;
        var cosLat = Math.cos(midLat);
        var px = (p[1] - s.start[1]) * cosLat * 111320;
        var py = (p[0] - s.start[0]) * 110574;

        var t = (px * s.dx + py * s.dy) / s.distSq;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;

        var projX = s.dx * t;
        var projY = s.dy * t;
        var dSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);

        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestRouteDist = s.cumStart + t * s.distance;
        }
      }
      return bestRouteDist;
    }

    // ── Get Exact [lat, lng] and Road Bearing at Cumulative Distance ────────
    function getPointAtRouteDistance(dist, segs, total) {
      if (!segs || segs.length === 0) return { latLng: [USER_LAT, USER_LNG], bearing: 0 };
      var d = Math.max(0, Math.min(dist, total));

      var seg = segs[0];
      for (var i = 0; i < segs.length; i++) {
        if (d <= segs[i].cumEnd || i === segs.length - 1) {
          seg = segs[i];
          break;
        }
      }

      var offset = d - seg.cumStart;
      var t = seg.distance > 0 ? Math.max(0, Math.min(1, offset / seg.distance)) : 0;
      var lat = seg.start[0] + (seg.end[0] - seg.start[0]) * t;
      var lng = seg.start[1] + (seg.end[1] - seg.start[1]) * t;

      return {
        latLng: [lat, lng],
        bearing: seg.bearing
      };
    }

    var currentRouteDistance = 0;
    var targetRouteDistance = 0;
    var currentBusSpeedKmh = 28;
    var isInitialized = false;
    var lastAnimTime = 0;

    function smoothRotateHeading(currentH, targetH) {
      var diff = ((targetH - currentH + 180) % 360) - 180;
      return currentH + diff;
    }

    // Default bus placement directly on the real road route with road tangent heading
    if (routeData.total > 0) {
      var initialDist = routeData.total * 0.15;
      currentRouteDistance = initialDist;
      targetRouteDistance = initialDist;
      var initPos = getPointAtRouteDistance(initialDist, routeData.segs, routeData.total);
      currentBusHeading = initPos.bearing;
      createBusMarker(initPos.latLng, currentBusHeading);
      isInitialized = true;
    }

    // ── 60fps Smooth Road-Locked Movement Engine (requestAnimationFrame) ──
    function animateBus(timestamp) {
      if (!lastAnimTime) lastAnimTime = timestamp;
      var dt = (timestamp - lastAnimTime) / 1000;
      lastAnimTime = timestamp;

      // Handle large time gaps (e.g. app in background or frame drop)
      if (dt > 0.1) dt = 0.1;
      if (dt < 0.001) dt = 0.001;

      if (routeData.total > 0 && busMarker && isInitialized) {
        var distDiff = targetRouteDistance - currentRouteDistance;

        if (Math.abs(distDiff) > 0.05) {
          var baseSpeedMps = (currentBusSpeedKmh * 1000) / 3600;
          var catchUpSpeedMps = Math.abs(distDiff) / 1.6;
          var effectiveSpeedMps = Math.max(baseSpeedMps * 0.6, Math.min(baseSpeedMps * 2.2, catchUpSpeedMps));
          var moveDist = effectiveSpeedMps * dt;

          if (distDiff > 0) {
            currentRouteDistance = Math.min(targetRouteDistance, currentRouteDistance + moveDist);
          } else {
            currentRouteDistance = Math.max(targetRouteDistance, currentRouteDistance - moveDist);
          }

          var state = getPointAtRouteDistance(currentRouteDistance, routeData.segs, routeData.total);
          busLatLng = state.latLng;
          busMarker.setLatLng(state.latLng);

          currentBusHeading = smoothRotateHeading(currentBusHeading, state.bearing);
          var el = busMarker.getElement();
          if (el) {
            var v = el.querySelector('.bus-vehicle');
            if (v) v.style.transform = 'rotate(' + currentBusHeading + 'deg)';
          }

          if (isFollowing) {
            map.panTo(state.latLng, { animate: false });
          }
        }
      }

      requestAnimationFrame(animateBus);
    }
    requestAnimationFrame(animateBus);

    function postRN(obj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }

    // ── Auto-Fit Camera to User, Bus, Stops, and Road Route 
    function computeFullBounds() {
      var b = L.latLngBounds([]);

      // 1. All road route points
      if (latLngs && latLngs.length >= 2) {
        b.extend(latLngs);
      }

      // 2. All route stops
      if (STOPS && STOPS.length > 0) {
        for (var i = 0; i < STOPS.length; i++) {
          b.extend([STOPS[i].latitude, STOPS[i].longitude]);
        }
      }

      // 3. User's current location (validate not (0,0) or NaN)
      if (typeof USER_LAT === 'number' && !isNaN(USER_LAT) && typeof USER_LNG === 'number' && !isNaN(USER_LNG) &&
          Math.abs(USER_LAT) > 0.01 && Math.abs(USER_LNG) > 0.01) {
        b.extend([USER_LAT, USER_LNG]);
      }

      // 4. Bus marker location
      if (busLatLng) {
        b.extend(busLatLng);
      }

      return b;
    }

    function fitAllInView(animated) {
      if (!map) return;
      map.invalidateSize({ pan: false });
      var b = computeFullBounds();
      if (b && b.isValid()) {
        map.fitBounds(b, {
          paddingTopLeft: [35, 95],      // [left, top] - clear status bar & top navigation
          paddingBottomRight: [35, 305], // [right, bottom] - clear bottom card completely!
          maxZoom: 16,
          animate: !!animated
        });
      }
    }
    window.fitAllInView = fitAllInView;

    // Trigger auto-fit bounds on initial load and after container layout settles
    fitAllInView(false);
    setTimeout(function() { fitAllInView(false); }, 100);
    setTimeout(function() { fitAllInView(false); }, 300);
    setTimeout(function() { fitAllInView(false); }, 750);
    window.addEventListener('load', function() { setTimeout(function() { fitAllInView(false); }, 100); });
    window.addEventListener('resize', function() { fitAllInView(false); });

    var hasAutoFittedLiveBus = false;

    // Exposed controls to React Native
    window.recenterMap = function() {
      fitAllInView(true);
    };

    window.toggleTileLayer = function() {
      map.removeLayer(tileLayers[currentTileIndex]);
      currentTileIndex = (currentTileIndex + 1) % tileLayers.length;
      tileLayers[currentTileIndex].addTo(map);
    };

    window.setFollowMode = function(enabled) {
      isFollowing = !!enabled;
      if (isFollowing && busLatLng) {
        map.panTo(busLatLng, { animate: true });
      }
    };

    // Socket.IO for Live Bus Updates
    var sock = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
    });

    sock.on('connect', function() {
      postRN({ type: 'connected' });
      // Re-request state sync on every connection (handles reconnects too)
      sock.emit('sync:buses');
    });

    // Monotonic sequence guard: per-bus last seen sequence number.
    // Any packet arriving with sequence <= this value is stale and discarded.
    var lastSeenSequence = -1;
    // Track the last accepted routeProgress for geometry remapping
    var lastAcceptedProgress = -1;

    function handleBusUpdate(data) {
      if (!data) return;
      var matchesBus = (data.busNumber && data.busNumber.toString() === TARGET_BUS.toString()) ||
                       (data.routeNumber && data.routeNumber.toString() === TARGET_ROUTE.toString());
      if (!matchesBus) return;

      //  Stale Packet Guard 
      // Discard out-of-order UDP/WS packets using the server-assigned sequence
      // number. This is the primary fix for backward bus movement.
      if (typeof data.sequence === 'number') {
        if (data.sequence <= lastSeenSequence) return; // stale — discard
        lastSeenSequence = data.sequence;
      }

      //  Trip Completion 
      if (data.isDestinationReached && data.simulationStatus === 'STOPPED') {
        // Snap bus to exact end of route and freeze
        targetRouteDistance = routeData.total;
        currentRouteDistance = routeData.total;
        var endState = getPointAtRouteDistance(routeData.total, routeData.segs, routeData.total);
        if (busMarker) busMarker.setLatLng(endState.latLng);
        busLatLng = endState.latLng;
        postRN({
          type: 'telemetry',
          speed: 0,
          heading: currentBusHeading,
          etaMinutes: 0,
          currentStop: data.currentStop,
          nextStop: data.nextStop || 'Destination Reached',
          distanceToNextStopKm: 0,
          isMoving: false,
          motionStatus: 'PARKED',
        });
        return;
      }

      if (data.speed !== undefined && data.speed > 0) {
        currentBusSpeedKmh = data.speed;
      }

      //  Authoritative Route Progress (primary path) 
      // The server sends routeProgress (0.0–1.0) which is the unambiguous
      // traveledDistance/totalDistance ratio. This avoids the lat/lng snap
      // ambiguity that caused apparent backward movement.
      var newTargetDist;
      if (typeof data.routeProgress === 'number' && routeData.total > 0) {
        // Clamp to [0, 1] to be safe
        var progress = Math.max(0, Math.min(1, data.routeProgress));
        newTargetDist = progress * routeData.total;
      } else if (data.latitude != null && data.longitude != null) {
        // Fallback: snap lat/lng to route (older server without routeProgress)
        newTargetDist = snapPointToRoute([data.latitude, data.longitude], routeData.segs);
      } else {
        return;                 // no usable position data
      }

      if (!isInitialized) {
        // First update: place bus exactly at the server's reported position
        currentRouteDistance = newTargetDist;
        targetRouteDistance = newTargetDist;
        var initState = getPointAtRouteDistance(currentRouteDistance, routeData.segs, routeData.total);
        busLatLng = initState.latLng;
        currentBusHeading = initState.bearing;
        if (!busMarker) {
          createBusMarker(initState.latLng, currentBusHeading);
        } else {
          busMarker.setLatLng(initState.latLng);
        }
        isInitialized = true;
      } else {
        //  Monotonic Forward-Only Enforcement 
        // Never let the target jump backward; this prevents visual regression
        // even if a stale packet somehow passes the sequence guard.
        // Exception: allow small backward correction (≤ 50m) to handle route
        // resets or minor OSRM geometry mismatches.
        var candidateDiff = newTargetDist - targetRouteDistance;
        if (candidateDiff >= 0) {
          // Normal forward movement: accept directly
          targetRouteDistance = newTargetDist;
        } else if (candidateDiff > -50) {
          // Tiny backward (<50m): minor correction acceptable
          targetRouteDistance = newTargetDist;
        }
        // Large backward jump (>50m): silently ignore — likely a stale packet
      }

      if (!hasAutoFittedLiveBus) {
        hasAutoFittedLiveBus = true;
        setTimeout(function() { fitAllInView(false); }, 150);
      }

      // Remember the last accepted progress for geometry remapping
      lastAcceptedProgress = typeof data.routeProgress === 'number'
        ? Math.max(0, Math.min(1, data.routeProgress))
        : (routeData.total > 0 ? currentRouteDistance / routeData.total : 0);

      postRN({
        type: 'telemetry',
        speed: data.speed,
        heading: currentBusHeading,
        etaMinutes: data.etaMinutes,
        currentStop: data.currentStop,
        nextStop: data.nextStop,
        distanceToNextStopKm: data.distanceToNextStopKm || data.distanceKm,
        isMoving: (data.speed || 0) > 2,
        motionStatus: (data.speed || 0) > 2 ? 'MOVING' : 'PARKED',
      });
    }

    sock.on('bus:location', handleBusUpdate);
    sock.on('bus:location:update', handleBusUpdate);

    //  Real OSRM Road Geometry from Server 
    // The backend emits 'bus:route:geometry' once on trip start (and on reconnect
    // via syncToSocket). Coordinates arrive as [lat, lng] numeric arrays.
    sock.on('bus:route:geometry', function(data) {
      if (!data || !data.coordinates || data.coordinates.length < 2) return;
      var matches = (data.routeNumber && data.routeNumber.toString() === TARGET_ROUTE.toString()) ||
                    (data.busNumber && data.busNumber.toString() === TARGET_BUS.toString());
      if (!matches) return;

      // data.coordinates = [[lat, lng], [lat, lng], ...]
      var newLatLngs = data.coordinates.map(function(c) {
        // Support both [lat, lng] array format AND {latitude, longitude} object format
        if (Array.isArray(c)) return [c[0], c[1]];
        return [c.latitude, c.longitude];
      });

      if (newLatLngs.length < 2) return;

      // Store route progress BEFORE rebuilding segments (old total may differ)
      var progressBeforeRebuild = lastAcceptedProgress >= 0
        ? lastAcceptedProgress
        : (routeData.total > 0 ? currentRouteDistance / routeData.total : 0);

      // Rebuild route segments from the real OSRM road geometry
      latLngs = newLatLngs;
      routeData = buildRouteSegments(latLngs);

      // Remap route distances into the new geometry's coordinate space
      if (routeData.total > 0 && progressBeforeRebuild >= 0) {
        var newDist = progressBeforeRebuild * routeData.total;
        currentRouteDistance = newDist;
        targetRouteDistance = newDist;
        // Move bus marker to correct position in new geometry
        var remappedState = getPointAtRouteDistance(newDist, routeData.segs, routeData.total);
        busLatLng = remappedState.latLng;
        currentBusHeading = remappedState.bearing;
        if (busMarker) busMarker.setLatLng(remappedState.latLng);
      }

      // Update the visible polyline with the real road geometry
      if (routePoly) routePoly.setLatLngs(newLatLngs);
      if (casingPoly) casingPoly.setLatLngs(newLatLngs);

      // Update stops from server payload if provided
      if (data.stops && data.stops.length > 0) {
        STOPS = data.stops;
      }

      // Re-fit camera to show the real road and all stops
      setTimeout(function() { fitAllInView(false); }, 150);
    });
  </script>
</body>
</html>`;
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  const params = useLocalSearchParams<{ busId?: string; busNumber?: string; routeName?: string;
    routeNumber?: string;
    currentStop?: string;
    nextStop?: string;
    speed?: string;
    motionStatus?: string;
    distanceKm?: string;
    etaMinutes?: string;
    userLat?: string;
    userLng?: string;
  }>();

  const busNumber = params.busNumber || '202';
  const routeNumber =
    params.routeNumber ||
    (busNumber === '101'
      ? '101'
      : busNumber === '109'
      ? '109'
      : busNumber === '203'
      ? '203'
      : busNumber === '204'
      ? '204'
      : busNumber === '303'
      ? '303'
      : busNumber === '304'
      ? '304'
      : busNumber === '305'
      ? '305'
      : '202');

  const routeName =
    params.routeName ||
    (routeNumber === '101'
      ? 'Downtown → Nyabugogo'
      : routeNumber === '109'
      ? 'Route 109 — Nyabugogo → Remera'
      : routeNumber === '203'
      ? 'Nyabugogo → Remera'
      : routeNumber === '204'
      ? 'Kimironko → Downtown'
      : routeNumber === '303'
      ? 'Route 303 — Nyabugogo → Nyacyonga'
      : routeNumber === '304'
      ? 'Route 304 — Nyacyonga → Nyabugogo'
      : routeNumber === '305'
      ? 'Route 305 — Nyabugogo → Batsinda → Nyacyonga'
      : 'Nyabugogo → Kimironko');

  const userLat = params.userLat ? parseFloat(params.userLat) : -1.9400;
  const userLng = params.userLng ? parseFloat(params.userLng) : 30.1200;

  const currentStop = telemetry?.currentStop || params.currentStop || 'Nyabugogo';
  const nextStop = telemetry?.nextStop || params.nextStop || 'Kacyiru';
  const speed = telemetry?.speed != null ? Math.round(telemetry.speed) : (params.speed ? parseInt(params.speed) : 32);
  const isMoving = telemetry ? telemetry.isMoving : speed > 2;
  const motionStatus = isMoving ? 'MOVING' : 'PARKED';
  const distanceKm = telemetry?.distanceToNextStopKm != null ? telemetry.distanceToNextStopKm.toFixed(1) : (params.distanceKm || '1.2');
  const etaMinutes = telemetry?.etaMinutes != null ? telemetry.etaMinutes : (params.etaMinutes ? parseInt(params.etaMinutes) : 3);

  const waypoints = useMemo(() => {
    if (ROUTE_WAYPOINTS[routeNumber] && ROUTE_WAYPOINTS[routeNumber].length > 0) {
      return ROUTE_WAYPOINTS[routeNumber];
    }
    const stops = DEFAULT_ROUTE_STOPS[routeNumber];
    if (stops && stops.length > 0) {
      return stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));
    }
    return ROUTE_WAYPOINTS['202'] || [];
  }, [routeNumber]);

  const mapHtml = useMemo(() => {
    return buildSingleBusMapHtml(
      BACKEND_URL,
      routeNumber,
      busNumber,
      waypoints,
      userLat,
      userLng,
    );
  }, [routeNumber, busNumber, waypoints, userLat, userLng]);

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'telemetry') {
        setTelemetry(msg as Telemetry);
      }
    } catch {
      // Ignore malformed message
    }
  }, []);

  const handleRecenter = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.recenterMap(); true;');
  }, []);

  const handleToggleLayer = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.toggleTileLayer(); true;');
  }, []);

  const handleTrackBus = useCallback(() => {
    const next = !isFollowing;
    setIsFollowing(next);
    webViewRef.current?.injectJavaScript(`window.setFollowMode(${next}); true;`);
  }, [isFollowing]);

  const handleToggleAlerts = useCallback(() => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    Alert.alert(
      next ? 'Alerts Activated' : 'Alerts Disabled',
      next
        ? `You will receive push notifications when Bus ${busNumber} approaches your stop.`
        : `Arrival notifications for Bus ${busNumber} have been paused.`,
    );
  }, [alertsEnabled, busNumber]);

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <Text style={styles.titleText}>Bus {busNumber}</Text>
          <Text style={styles.subtitleText}>Live Route</Text>
        </View>

        {/* Right balance spacer to keep title centered */}
        <View style={{ width: 40 }} />
      </View>

      {/* Full-Screen Interactive Leaflet Map */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        onMessage={handleMessage}
        onLoad={() => {
          setMapLoaded(true);
          webViewRef.current?.injectJavaScript(
            'window.fitAllInView && window.fitAllInView(false); true;',
          );
        }}
        style={StyleSheet.absoluteFillObject}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />

      {/* Loading Indicator */}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#04325E" />
          <Text style={styles.loadingText}>Loading Bus {busNumber} Route...</Text>
        </View>
      )}

      {/* Floating Action Controls on Map (Top-Right) */}
      <View style={[styles.mapFloatingControls, { top: insets.top + 74 }]}>
        <TouchableOpacity
          style={styles.mapFloatingBtn}
          activeOpacity={0.85}
          onPress={handleRecenter}
        >
          <MaterialIcons name="my-location" size={20} color="#04325E" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapFloatingBtn}
          activeOpacity={0.85}
          onPress={handleToggleLayer}
        >
          <MaterialIcons name="layers" size={20} color="#04325E" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Card */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Card Header: Bus Badge & Motion Status */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.bottomBusBadge}>
            <Text style={styles.bottomBusBadgeText}>BUS {busNumber}</Text>
          </View>

          {isMoving ? (
            <View style={styles.bottomMovingBadge}>
              <View style={styles.bottomLiveDot} />
              <Text style={styles.bottomLiveText}>MOVING</Text>
            </View>
          ) : (
            <View style={styles.bottomParkedBadge}>
              <View style={styles.bottomParkedDot} />
              <Text style={styles.bottomParkedText}>PARKED</Text>
            </View>
          )}
        </View>

        {/* Route Name & Next Stop */}
        <Text style={styles.bottomRouteTitle}>{routeName}</Text>
        <Text style={styles.bottomNextStopRow}>
          <Text style={styles.nextStopLabel}>Next stop: </Text>
          <Text style={styles.nextStopVal}>{nextStop}</Text>
        </Text>

        {/* 3-Column Stats Row with Icons */}
        <View style={styles.statsCardRow}>
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <Ionicons name="time-outline" size={13} color="#64748B" />
              <Text style={styles.statLabelText}>ETA to next stop</Text>
            </View>
            <Text style={styles.statValText}>{etaMinutes} min</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.statLabelText}>Distance to next stop</Text>
            </View>
            <Text style={styles.statValText}>{distanceKm} km</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <Ionicons name="speedometer-outline" size={13} color="#64748B" />
              <Text style={styles.statLabelText}>Speed</Text>
            </View>
            <Text style={styles.statValText}>{speed} km/h</Text>
          </View>
        </View>

        {/* Bottom Actions: Track Bus + Alerts Button */}
        <View style={styles.bottomActionRow}>
          <TouchableOpacity
            style={[styles.trackBusBtn, isFollowing && styles.trackBusBtnActive]}
            activeOpacity={0.85}
            onPress={handleTrackBus}
          >
            <MaterialCommunityIcons name="broadcast" size={18} color="#FFFFFF" />
            <Text style={styles.trackBusBtnText}>
              {isFollowing ? 'FOLLOWING BUS' : 'TRACK BUS'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.alertsBtn, alertsEnabled && styles.alertsBtnActive]}  activeOpacity={0.85}
            onPress={handleToggleAlerts}
          >
            <Ionicons name={alertsEnabled ? 'notifications' : 'notifications-outline'}  size={17}
              color={alertsEnabled ? '#FFFFFF' : '#04325E'}
            />
            <Text style={[styles.alertsBtnText, alertsEnabled && styles.alertsBtnTextActive]}>
              Alerts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04325E',
  },

  
  topBar: {
    backgroundColor: '#04325E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93C5FD',
    marginTop: 1,
  },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // Map Floating Action Controls
  mapFloatingControls: {
    position: 'absolute',
    right: 16,
    gap: 10,
    zIndex: 15,
  },
  mapFloatingBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Bottom Sheet Card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomBusBadge: {
    backgroundColor: '#04325E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomBusBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  bottomMovingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bottomLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  bottomLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  bottomParkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bottomParkedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  bottomParkedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.4,
  },
  bottomRouteTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  bottomNextStopRow: {
    fontSize: 13,
    marginBottom: 14,
  },
  nextStopLabel: {
    color: '#64748B',
    fontWeight: '500',
  },
  nextStopVal: {
    color: '#04325E',
    fontWeight: '800',
  },

  // Stats Card Row
  statsCardRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  statValText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#04325E',
  },

  // Bottom Buttons
  bottomActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackBusBtn: {
    flex: 1,
    backgroundColor: '#04325E',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#04325E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  trackBusBtnActive: {
    backgroundColor: '#059669',
  },
  trackBusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  alertsBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#04325E',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alertsBtnActive: {
    backgroundColor: '#04325E',
  },
  alertsBtnText: {
    color: '#04325E',
    fontSize: 13,
    fontWeight: '800',
  },
  alertsBtnTextActive: {
    color: '#FFFFFF',
  },
});
