import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BACKEND_URL } from '../constants/config';
import { ROUTE_WAYPOINTS } from '../constants/routeWaypoints';

// Types & Constants

interface Telemetry {
  busNumber: string;
  routeNumber: string;
  routeColor: string;
  speed: number;
  heading: number;
  etaMinutes: number;
  currentStop: string;
  nextStop: string;
  progress: number;
  distanceToNextStopKm: number;
  isDestinationReached: boolean;
  simulationStatus: string;
}

const ROUTE_TABS = [
  { id: 'ALL', label: 'All Routes', color: '#04325E' },
  { id: '101', label: 'Route 101', color: '#2563EB' },
  { id: '202', label: 'Route 202', color: '#EF4444' },
  { id: '203', label: 'Route 203', color: '#16A34A' },
  { id: '204', label: 'Route 204', color: '#7C3AED' },
];

// Leaflet + Socket.IO Map HTML
// Connects to Socket.IO backend, pre-renders real Kigali road network lines
// for all routes (101, 202, 203, 204), animates live buses, and provides interactive
// route zooming and live telemetry to React Native.

const buildMapHtml = (backendUrl: string, waypointsJson: string): string => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#E8EDF2}
    #map{width:100vw;height:100vh}
    .leaflet-control-attribution{font-size:8px!important;background:rgba(255,255,255,0.6)!important;padding:1px 4px!important;border-radius:3px!important}
    .leaflet-control-attribution a{color:#0B3D66!important}

    /*  Bus marker: centered precisely on the road coordinates  */
    .tega-bus-wrap{position:relative;width:50px;height:50px;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .tega-bus-pulse{position:absolute;width:46px;height:46px;border-radius:50%;opacity:0;animation:tegaPulse 2.2s ease-out infinite;pointer-events:none}
    @keyframes tegaPulse{0%{transform:scale(.55);opacity:.85}100%{transform:scale(2.1);opacity:0}}
    .tega-bus-vehicle{position:relative;z-index:10;width:22px;height:42px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,.55));transform-origin:center center;transition:transform .55s cubic-bezier(0.25,0.46,0.45,0.94)}
    .tega-bus-label{position:absolute;top:48px;left:50%;transform:translateX(-50%);color:#fff;font-size:9.5px;font-weight:900;font-family:system-ui,-apple-system,sans-serif;padding:1.5px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.3);z-index:12;pointer-events:none}

    /*  Stop marker  */
    .tega-stop{display:flex;align-items:center;justify-content:center;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,.3)}
    .tega-stop-current{animation:stopBeat 1.4s ease-in-out infinite}
    @keyframes stopBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}

    /*  Tooltip  */
    .leaflet-tooltip{font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;background:#0F172A;color:#fff;border:none;border-radius:6px;padding:3px 8px;box-shadow:0 2px 8px rgba(0,0,0,.35)}
    .leaflet-tooltip-top::before{border-top-color:#0F172A}

    /*  Connection status bar  */
    #conn-bar{position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#10B981,#2563EB,#7C3AED);z-index:9999;opacity:0;transition:opacity .4s}
    #conn-bar.loading{opacity:1;animation:barSlide 1.2s ease-in-out infinite}
    @keyframes barSlide{0%{background-position:0% 50%}100%{background-position:100% 50%}}
  </style>
</head>
<body>
  <div id="conn-bar" class="loading"></div>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <script>
    var BACKEND_URL = '${backendUrl}';
    var INITIAL_ROUTES = ${waypointsJson};

    var DEFAULT_STOPS = {
      '101': [
        { name: 'Downtown (Kigali City)', latitude: -1.9500, longitude: 30.0580, order: 1 },
        { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, order: 2 },
        { name: 'Rwandex', latitude: -1.9480, longitude: 30.0500, order: 3 },
        { name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, order: 4 },
        { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, order: 5 },
      ],
      '202': [
        { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, order: 1 },
        { name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, order: 2 },
        { name: 'Remera', latitude: -1.9502, longitude: 30.1073, order: 3 },
        { name: 'Kimironko Market', latitude: -1.9400, longitude: 30.1200, order: 4 },
      ],
      '203': [
        { name: 'Nyabugogo Terminal', latitude: -1.9346, longitude: 30.0540, order: 1 },
        { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, order: 2 },
        { name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, order: 3 },
        { name: 'Remera Bus Park', latitude: -1.9502, longitude: 30.1073, order: 4 },
      ],
      '204': [
        { name: 'Kimironko Market', latitude: -1.9400, longitude: 30.1200, order: 1 },
        { name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, order: 2 },
        { name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, order: 3 },
        { name: 'Downtown (Kigali City)', latitude: -1.9500, longitude: 30.0580, order: 4 },
      ]
    };

    var PALETTE = {
      '101': '#2563EB',
      '202': '#EF4444',
      '203': '#16A34A',
      '204': '#7C3AED',
      '205': '#EA580C',
      '206': '#0D9488',
    };
    var FALLBACK = ['#2563EB', '#EF4444', '#16A34A', '#7C3AED', '#EA580C', '#0D9488'];
    var colorIdx = 0;
    var colorMap = {};
    function getColor(routeNum, routeColor) {
      if (routeColor) return routeColor;
      if (PALETTE[routeNum]) return PALETTE[routeNum];
      if (!colorMap[routeNum]) {
        colorMap[routeNum] = FALLBACK[colorIdx % FALLBACK.length];
        colorIdx++;
      }
      return colorMap[routeNum];
    }

    var busMarkers = {};
    var dynamicRoutes = {};
    var dynamicRoutesCoords = {};
    var busAnimState = {};
    var staticRoutes = {};
    var routeBounds = {};
    var stopGroups = {};
    var followBusId = null;
    var isFollowing = false;
    var activeRouteId = 'ALL';

    var map = L.map('map', {
      center: [-1.9441, 30.0750],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);

    function busSvg(color) {
      return [
        '<svg width="22" height="42" viewBox="0 0 22 42" fill="none" xmlns="http://www.w3.org/2000/svg">',
        '  <defs>',
        '    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">',
        '      <stop offset="0%" stop-color="' + lighten(color) + '"/>',
        '      <stop offset="100%" stop-color="' + darken(color) + '"/>',
        '    </linearGradient>',
        '  </defs>',
        '  <rect x="1" y="3" width="20" height="36" rx="4" fill="url(#bg)" stroke="white" stroke-width="1.5"/>',
        '  <polygon points="11,0 6,6 16,6" fill="rgba(255,255,255,0.95)"/>',
        '  <rect x="3" y="4" width="16" height="7" rx="2" fill="rgba(147,210,255,0.78)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>',
        '  <rect x="1.5" y="13" width="2.5" height="16" rx="1.2" fill="rgba(15,23,42,0.45)"/>',
        '  <rect x="18" y="13" width="2.5" height="16" rx="1.2" fill="rgba(15,23,42,0.45)"/>',
        '  <rect x="0" y="8" width="2" height="5" rx="1" fill="#0F172A"/>',
        '  <rect x="20" y="8" width="2" height="5" rx="1" fill="#0F172A"/>',
        '  <rect x="0" y="27" width="2" height="5" rx="1" fill="#0F172A"/>',
        '  <rect x="20" y="27" width="2" height="5" rx="1" fill="#0F172A"/>',
        '  <rect x="3" y="1.5" width="5" height="2" rx="0.8" fill="#FEF08A"/>',
        '  <rect x="14" y="1.5" width="5" height="2" rx="0.8" fill="#FEF08A"/>',
        '  <rect x="3" y="38.5" width="5" height="2" rx="0.8" fill="#EF4444"/>',
        '  <rect x="14" y="38.5" width="5" height="2" rx="0.8" fill="#EF4444"/>',
        '</svg>',
      ].join('');
    }

    function lighten(hex) {
      var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      r = Math.min(255, r + 40); g = Math.min(255, g + 40); b = Math.min(255, b + 40);
      return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
    }
    function darken(hex) {
      var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      r = Math.max(0, r - 40); g = Math.max(0, g - 40); b = Math.max(0, b - 40);
      return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
    }

    function makeBusIcon(busNum, routeNum, color, heading) {
      var label = routeNum || (busNum || '').replace(/^BUS-?/i, '') || '?';
      var html = [
        '<div class="tega-bus-wrap">',
        '  <div class="tega-bus-pulse" style="border:2.5px solid ' + color + ';background:' + color + '18"></div>',
        '  <div class="tega-bus-vehicle" style="transform:rotate(' + heading + 'deg)">',
        busSvg(color),
        '  </div>',
        '  <div class="tega-bus-label" style="background:' + color + '">BUS ' + label + '</div>',
        '</div>',
      ].join('');
      return L.divIcon({ html: html, className: '', iconSize: [50, 50], iconAnchor: [25, 25], popupAnchor: [0, -25] });
    }

    function makeStopIcon(type, color) {
      var cfg = {
        origin: { s: 15, bg: color, border: 'white', inner: '' },
        destination: { s: 17, bg: '#0B3D66', border: color, inner: '' },
        passed: { s: 10, bg: color, border: color, inner: '' },
        current: { s: 15, bg: color, border: 'white', inner: '<div style="width:6px;height:6px;border-radius:50%;background:white"></div>' },
        upcoming: { s: 11, bg: 'white', border: color || '#94A3B8', inner: '' },
      };
      var c = cfg[type] || cfg.upcoming;
      var extraClass = type === 'current' ? ' tega-stop-current' : '';
      var html = '<div class="tega-stop' + extraClass + '" style="width:' + c.s + 'px;height:' + c.s + 'px;background:' + c.bg + ';border:2.5px solid ' + c.border + '">' + c.inner + '</div>';
      return L.divIcon({ html: html, className: '', iconSize: [c.s, c.s], iconAnchor: [c.s / 2, c.s / 2] });
    }

    function drawStops(key, stops, color) {
      if (stopGroups[key]) { map.removeLayer(stopGroups[key]); }
      var g = L.layerGroup();
      stops.forEach(function(s, i) {
        var t = i === 0 ? 'origin' : i === stops.length - 1 ? 'destination' : 'upcoming';
        var icon = makeStopIcon(t, color);
        L.marker([s.latitude, s.longitude], { icon: icon, zIndexOffset: 500 })
          .bindTooltip(s.name, { direction: 'top', offset: [0, -8], opacity: 0.95 })
          .addTo(g);
      });
      g.addTo(map);
      stopGroups[key] = g;
    }

    //  Pre-render all Kigali routes with actual road geometry
    function renderStaticRoutes() {
      if (!INITIAL_ROUTES) return;
      Object.keys(INITIAL_ROUTES).forEach(function (rNum) {
        var waypoints = INITIAL_ROUTES[rNum];
        if (!waypoints || waypoints.length < 2) return;
        var color = getColor(rNum);
        var latLngs = waypoints.map(function (w) { return [w.latitude, w.longitude]; });

        // Outer glow underlay
        var casing = L.polyline(latLngs, {
          color: color,
          weight: 7,
          opacity: 0.28,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        }).addTo(map);

        // Vibrant main road line
        var poly = L.polyline(latLngs, {
          color: color,
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true
        }).addTo(map);

        poly.on('click', function() {
          window.selectRoute(rNum);
          postRN({ type: 'routeSelected', routeNumber: rNum });
        });

        staticRoutes[rNum] = { casing: casing, poly: poly, color: color };
        routeBounds[rNum] = poly.getBounds();

        // Draw stop pins
        var stops = DEFAULT_STOPS[rNum];
        if (stops) {
          drawStops('route_' + rNum, stops, color);
        }
      });
    }

    renderStaticRoutes();

    // ── Geodesic & Road Animation Math Helpers ──────────────────────────
    function distSq(p1, p2) {
      var dlat = p1[0] - p2[0];
      var dlng = p1[1] - p2[1];
      return dlat * dlat + dlng * dlng;
    }

    function getDistanceMeters(p1, p2) {
      var R = 6371000;
      var dLat = (p2[0] - p1[0]) * Math.PI / 180;
      var dLon = (p2[1] - p1[1]) * Math.PI / 180;
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function getBearing(p1, p2) {
      var lat1 = p1[0] * Math.PI / 180;
      var lat2 = p2[0] * Math.PI / 180;
      var dLon = (p2[1] - p1[1]) * Math.PI / 180;
      var y = Math.sin(dLon) * Math.cos(lat2);
      var x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      var brng = Math.atan2(y, x) * 180 / Math.PI;
      return (brng + 360) % 360;
    }

    function lerpAngle(a, b, t) {
      var diff = ((b - a + 540) % 360) - 180;
      return (a + diff * t + 360) % 360;
    }

    function getWaypointLatLng(wp) {
      if (!wp) return [0, 0];
      if (Array.isArray(wp)) return [wp[0], wp[1]];
      return [wp.latitude, wp.longitude];
    }

    // ── Build road sub-path between two GPS coordinates using actual road geometry ──
    function buildRoadPath(busId, routeNum, fromPos, toPos) {
      var waypoints = null;
      if (busId && dynamicRoutesCoords[busId] && dynamicRoutesCoords[busId].length >= 2) {
        waypoints = dynamicRoutesCoords[busId];
      } else if (routeNum && INITIAL_ROUTES && INITIAL_ROUTES[routeNum] && INITIAL_ROUTES[routeNum].length >= 2) {
        waypoints = INITIAL_ROUTES[routeNum];
      }

      if (!waypoints || waypoints.length < 2) {
        return [fromPos, toPos];
      }

      var bestFromIdx = -1, bestFromDist = Infinity;
      var bestToIdx = -1, bestToDist = Infinity;

      for (var i = 0; i < waypoints.length; i++) {
        var wp = getWaypointLatLng(waypoints[i]);
        var df = distSq(fromPos, wp);
        if (df < bestFromDist) {
          bestFromDist = df;
          bestFromIdx = i;
        }
        var dt = distSq(toPos, wp);
        if (dt < bestToDist) {
          bestToDist = dt;
          bestToIdx = i;
        }
      }

      if (bestFromDist > 0.00015 || bestToDist > 0.00015 || bestFromIdx === -1 || bestToIdx === -1) {
        return [fromPos, toPos];
      }

      if (Math.abs(bestToIdx - bestFromIdx) > 100) {
        return [fromPos, toPos];
      }

      var path = [fromPos];
      if (bestToIdx >= bestFromIdx) {
        for (var j = bestFromIdx; j <= bestToIdx; j++) {
          path.push(getWaypointLatLng(waypoints[j]));
        }
      } else {
        for (var j = bestFromIdx; j >= bestToIdx; j--) {
          path.push(getWaypointLatLng(waypoints[j]));
        }
      }
      path.push(toPos);

      var cleanPath = [path[0]];
      for (var k = 1; k < path.length; k++) {
        if (getDistanceMeters(cleanPath[cleanPath.length - 1], path[k]) > 0.5) {
          cleanPath.push(path[k]);
        }
      }

      return cleanPath.length >= 2 ? cleanPath : [fromPos, toPos];
    }

    // ── Continuous smooth animation along road geometry ──────────────────
    function animateBusAlongPath(busId, path, startHeading, targetHeading, durationMs) {
      var state = busAnimState[busId];
      var marker = busMarkers[busId];
      if (!state || !marker) return;

      if (state.animId) {
        cancelAnimationFrame(state.animId);
        state.animId = null;
      }

      var segLengths = [];
      var totalDist = 0;
      for (var i = 0; i < path.length - 1; i++) {
        var len = getDistanceMeters(path[i], path[i + 1]);
        segLengths.push(len);
        totalDist += len;
      }

      if (totalDist < 0.3) {
        state.currentPos = path[path.length - 1];
        marker.setLatLng(state.currentPos);
        return;
      }

      var duration = Math.max(1000, Math.min(durationMs || 2000, 4500));
      var startTime = performance.now();

      function frame(now) {
        var elapsed = now - startTime;
        var t = Math.min(elapsed / duration, 1.0);

        var currentDist = t * totalDist;

        var accum = 0;
        var currentLat = path[path.length - 1][0];
        var currentLng = path[path.length - 1][1];
        var segBearing = targetHeading;

        for (var s = 0; s < segLengths.length; s++) {
          var segLen = segLengths[s];
          if (currentDist <= accum + segLen || s === segLengths.length - 1) {
            var frac = segLen > 0 ? (currentDist - accum) / segLen : 1;
            frac = Math.max(0, Math.min(1, frac));

            currentLat = path[s][0] + (path[s + 1][0] - path[s][0]) * frac;
            currentLng = path[s][1] + (path[s + 1][1] - path[s][1]) * frac;
            segBearing = getBearing(path[s], path[s + 1]);
            break;
          }
          accum += segLen;
        }

        var pos = [currentLat, currentLng];
        state.currentPos = pos;
        marker.setLatLng(pos);

        var currentHeading = lerpAngle(state.currentHeading, segBearing, 0.18);
        state.currentHeading = currentHeading;

        var el = marker.getElement();
        if (el) {
          var veh = el.querySelector('.tega-bus-vehicle');
          if (veh) {
            veh.style.transform = 'rotate(' + currentHeading.toFixed(1) + 'deg)';
          }
        }

        if (t < 1.0) {
          state.animId = requestAnimationFrame(frame);
        } else {
          state.animId = null;
          state.currentPos = path[path.length - 1];
          marker.setLatLng(state.currentPos);
          if (targetHeading != null) {
            state.currentHeading = targetHeading;
            var elFinal = marker.getElement();
            if (elFinal) {
              var vehFinal = elFinal.querySelector('.tega-bus-vehicle');
              if (vehFinal) {
                vehFinal.style.transform = 'rotate(' + targetHeading.toFixed(1) + 'deg)';
              }
            }
          }
        }
      }

      state.animId = requestAnimationFrame(frame);
    }

    //  Update or create bus marker with continuous smooth interpolation 
    function updateBus(d) {
      var id = d.busId;
      var targetPos = [d.latitude, d.longitude];
      var color = getColor(d.routeNumber, d.routeColor);
      var targetHeading = d.heading != null ? d.heading : 0;
      var now = performance.now();

      var state = busAnimState[id];
      if (!state) {
        state = {
          currentPos: targetPos,
          currentHeading: targetHeading,
          lastUpdateTimestamp: now,
          estimatedInterval: 2000,
          animId: null
        };
        busAnimState[id] = state;

        var icon = makeBusIcon(d.busNumber, d.routeNumber, color, targetHeading);
        var m = L.marker(targetPos, { icon: icon, zIndexOffset: 1000 }).addTo(map);
        m.on('click', function() {
          followBusId = id;
          postRN({ type: 'busSelected', busId: id });
        });
        busMarkers[id] = m;
        return;
      }

      var interval = now - state.lastUpdateTimestamp;
      if (interval > 600 && interval < 10000) {
        state.estimatedInterval = interval;
      }
      state.lastUpdateTimestamp = now;

      var fromPos = state.currentPos;
      var fromHeading = state.currentHeading;

      var dist = getDistanceMeters(fromPos, targetPos);
      if (dist < 0.4) {
        return;
      }

      if (dist > 4000) {
        if (state.animId) cancelAnimationFrame(state.animId);
        state.currentPos = targetPos;
        state.currentHeading = targetHeading;
        busMarkers[id].setLatLng(targetPos);
        var el = busMarkers[id].getElement();
        if (el) {
          var veh = el.querySelector('.tega-bus-vehicle');
          if (veh) veh.style.transform = 'rotate(' + targetHeading + 'deg)';
        }
        return;
      }

      var roadPath = buildRoadPath(id, d.routeNumber, fromPos, targetPos);
      animateBusAlongPath(id, roadPath, fromHeading, targetHeading, state.estimatedInterval);

      if (d.routeNumber && staticRoutes[d.routeNumber]) {
        staticRoutes[d.routeNumber].poly.bringToFront();
      }

      if (isFollowing && (followBusId === id || !followBusId)) {
        followBusId = id;
        map.panTo(targetPos, { animate: true, duration: (state.estimatedInterval / 1000) * 0.95 });
      }
    }

    //  Live OSRM road geometry from backend 
    function drawRoute(d) {
      var id = d.busId;
      var color = getColor(d.routeNumber, d.routeColor);

      if (d.coordinates && d.coordinates.length > 0) {
        dynamicRoutesCoords[id] = d.coordinates;
      }

      if (dynamicRoutes[id]) { map.removeLayer(dynamicRoutes[id]); }
      var lls = d.coordinates.map(function(c) { return [c[0], c[1]]; });
      dynamicRoutes[id] = L.polyline(lls, {
        color: color,
        weight: 5.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      if (d.stops && d.stops.length > 0) {
        drawStops('live_' + id, d.stops, color);
      }
    }

    function postRN(obj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }

    //  Exposed to React Native 
    window.setFollowMode = function(on, busId) {
      isFollowing = !!on;
      if (busId) followBusId = busId;
      if (!on) followBusId = null;
    };

    window.selectRoute = function(rNum) {
      activeRouteId = rNum;
      if (!rNum || rNum === 'ALL') {
        Object.keys(staticRoutes).forEach(function(k) {
          staticRoutes[k].casing.setStyle({ opacity: 0.28, weight: 7 });
          staticRoutes[k].poly.setStyle({ opacity: 0.95, weight: 4.5 });
        });
        map.setView([-1.9441, 30.0750], 13, { animate: true });
        return;
      }
      Object.keys(staticRoutes).forEach(function(k) {
        if (k === rNum) {
          staticRoutes[k].casing.setStyle({ opacity: 0.55, weight: 9 });
          staticRoutes[k].poly.setStyle({ opacity: 1.0, weight: 6 });
          staticRoutes[k].poly.bringToFront();
        } else {
          staticRoutes[k].casing.setStyle({ opacity: 0.08, weight: 3 });
          staticRoutes[k].poly.setStyle({ opacity: 0.25, weight: 2 });
        }
      });
      if (routeBounds[rNum]) {
        map.fitBounds(routeBounds[rNum], { padding: [70, 70], maxZoom: 15, animate: true });
      }
    };

    //  Socket.IO Connection  
    var sock = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 25,
      reconnectionDelay: 2000,
      timeout: 15000,
    });

    sock.on('connect', function() {
      document.getElementById('conn-bar').classList.remove('loading');
      sock.emit('sync:buses');
      postRN({ type: 'connected' });
    });

    sock.on('disconnect', function(r) {
      document.getElementById('conn-bar').classList.add('loading');
      postRN({ type: 'disconnected', reason: r });
    });

    sock.on('connect_error', function(e) {
      postRN({ type: 'error', message: e.message });
    });

    function handleLocation(d) {
      updateBus(d);
      postRN({
        type: 'telemetry',
        busNumber: d.busNumber,
        routeNumber: d.routeNumber,
        routeColor: d.routeColor,
        speed: d.speed,
        heading: d.heading,
        etaMinutes: d.etaMinutes,
        currentStop: d.currentStop,
        nextStop: d.nextStop,
        progress: d.progress,
        distanceToNextStopKm: d.distanceToNextStopKm,
        isDestinationReached: d.isDestinationReached,
        simulationStatus: d.simulationStatus,
      });
    }

    sock.on('bus:route:geometry', drawRoute);
    sock.on('bus:location', handleLocation);
    sock.on('bus:location:update', handleLocation);
  </script>
</body>
</html>`;


// MapScreen Component

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [followMode, setFollowMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  // Pre-serialize waypoints JSON once
  const waypointsJson = useMemo(() => JSON.stringify(ROUTE_WAYPOINTS), []);
  const mapHtml = useMemo(() => buildMapHtml(BACKEND_URL, waypointsJson), [waypointsJson]);

  //  Handle messages from the WebView 
  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'connected') setIsConnected(true);
      if (msg.type === 'disconnected') setIsConnected(false);
      if (msg.type === 'telemetry') setTelemetry(msg as Telemetry);
      if (msg.type === 'routeSelected') setSelectedRoute(msg.routeNumber);
    } catch {
      // ignore malformed messages
    }
  }, []);

  //  Select route filter pill 
  const handleSelectRoute = useCallback((routeId: string) => {
    setSelectedRoute(routeId);
    webViewRef.current?.injectJavaScript(`window.selectRoute('${routeId}'); true;`);
  }, []);

  //  Toggle follow/track mode
  const handleTrackBus = useCallback(() => {
    const next = !followMode;
    setFollowMode(next);
    webViewRef.current?.injectJavaScript(`window.setFollowMode(${next}); true;`);
  }, [followMode]);

  //  Derived display values
  const etaDisplay = telemetry?.isDestinationReached ? 'Arrived'
    : telemetry?.etaMinutes ? `${telemetry.etaMinutes} min`
      : '—';
  const distDisplay = telemetry?.distanceToNextStopKm != null
    ? `${telemetry.distanceToNextStopKm.toFixed(1)} km` : '—';
  const speedDisplay = telemetry?.speed ? `${telemetry.speed} km/h` : '0 km/h';
  const busDisplay = telemetry?.busNumber ? `Bus ${telemetry.busNumber}` : 'Bus 101';
  const routeDisplay = telemetry
    ? `${telemetry.currentStop} → ${telemetry.nextStop}`
    : 'Connecting to live bus telemetry...';

  const simRunning = telemetry?.simulationStatus === 'RUNNING';
  const simPaused = telemetry?.simulationStatus === 'PAUSED';
  const statusText = simRunning ? 'On Trip' : simPaused ? 'Paused' : 'Standby';
  const statusColor = simRunning ? '#059669' : simPaused ? '#D97706' : '#94A3B8';
  const statusBg = simRunning ? '#ECFDF5' : simPaused ? '#FFFBEB' : '#F8FAFC';
  const statusIcon = simRunning ? 'checkmark-circle-outline' : simPaused ? 'pause-circle-outline' : 'radio-button-off-outline';

  return (
    <View style={styles.container}>

      {/*  Full-screen interactive Leaflet map  */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        onMessage={handleMessage}
        onLoad={() => setMapLoaded(true)}
        style={StyleSheet.absoluteFillObject}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowUniversalAccessFromFileURLs
        allowFileAccess
        scrollEnabled={false}
      />

      {/*  Loading shimmer while map initializes  */}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#04325E" />
          <Text style={styles.loadingText}>Loading Kigali Transit Map…</Text>
        </View>
      )}

      {/*  Top header overlay  */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.gpsBadge}>
          <View style={[styles.dot, { backgroundColor: isConnected ? '#10B981' : '#F59E0B' }]} />
          <Text style={styles.gpsText}>
            {isConnected ? 'Live GPS Active' : 'Connecting…'}
          </Text>
        </View>
      </View>

      {/*  Route Filter Pill Bar  */}
      <View style={[styles.routeBar, { top: insets.top + 60 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeScroll}>
          {ROUTE_TABS.map((r) => {
            const isSel = selectedRoute === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => handleSelectRoute(r.id)}
                style={[
                  styles.routePill,
                  isSel && { backgroundColor: r.color, borderColor: r.color },
                ]}
                activeOpacity={0.8}
              >
                {r.id !== 'ALL' && (
                  <View style={[styles.routeDot, { backgroundColor: isSel ? '#FFFFFF' : r.color }]} />
                )}
                <Text style={[styles.routePillText, isSel && styles.routePillTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/*  Bottom info card */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 12 }]}>

        {/* Card header */}
        <View style={styles.cardHeader}>
          <View>
            <View style={styles.busTitleRow}>
              <Text style={styles.busTitle}>{busDisplay}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Ionicons name={statusIcon as any} size={13} color={statusColor} />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>
            <Text style={styles.busRouteText}>{routeDisplay}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.statLabel}>ETA</Text>
            </View>
            <Text style={styles.statValue}>{etaDisplay}</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <MaterialIcons name="alt-route" size={14} color="#64748B" />
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <Text style={styles.statValue}>{distDisplay}</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <Ionicons name="speedometer-outline" size={14} color="#64748B" />
              <Text style={styles.statLabel}>Speed</Text>
            </View>
            <Text style={styles.statValue}>{speedDisplay}</Text>
          </View>
        </View>

        {/* Track button */}
        <TouchableOpacity
          style={[styles.trackButton, followMode && styles.trackButtonActive]}
          activeOpacity={0.85}
          onPress={handleTrackBus}
        >
          <Feather name={followMode ? 'crosshair' : 'navigation'} size={18} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>
            {followMode ? 'Following Bus' : 'Track Bus'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EDF2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // Top header
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Route filter pills
  routeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  routeScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  routeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  routePillTextActive: {
    color: '#FFFFFF',
  },

  // Bottom card
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    marginBottom: 16,
  },
  busTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  busRouteText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Track button
  trackButton: {
    backgroundColor: '#04325E',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trackButtonActive: {
    backgroundColor: '#059669',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
