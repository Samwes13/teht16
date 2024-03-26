import React, { useState, useEffect, useRef } from 'react';
import { View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


export default function MapScreen({ route }) {
    const address = route.params.address;
    const [coordinates, setCoordinates] = useState(null);
    const mapRef = useRef(null);
    const API_KEY = '65ddc8a6b925e563401390epvf659d7';
    
    useEffect(() => {
      const fetchCoordinates = async () => {
        try {
          const response = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${API_KEY}`);
          const responseData = await response.json();
          if (responseData && responseData.length > 0) {
            const { lat, lon } = responseData[0];
            const newCoordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
            setCoordinates(newCoordinates);
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                ...newCoordinates,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }, 1000);
            }
          } else {
            Alert.alert('Address not found.');
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
          Alert.alert('Error fetching coordinates.');
        }
      };
  
      fetchCoordinates();
    }, [address]);
  
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={coordinates ? {
            ...coordinates,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } : null}
        >
          {coordinates && (
            <Marker
              coordinate={coordinates}
              title={address}
            />
          )}
        </MapView>
      </View>
    );
  }
  