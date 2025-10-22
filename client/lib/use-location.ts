"use client";

export function useLocation() {
  let location: any = {};

  navigator.geolocation?.getCurrentPosition(
    (position) => {
      const userLng = position.coords.longitude;
      const userLat = position.coords.latitude;
      location.lat = userLat;
      location.lng = userLng;
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
    }
  );

  return { location };
}
