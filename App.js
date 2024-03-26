import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Alert, FlatList } from 'react-native';
import { ListItem } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';

const Stack = createStackNavigator();
const db = SQLite.openDatabase('addresses.db');

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Places" component={PlacesScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function PlacesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS addresses (id INTEGER PRIMARY KEY AUTOINCREMENT, address TEXT);'
      );
    }, null, updateList);
  }, []);

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM addresses;', [], (_, { rows }) =>
        setAddresses(rows._array)
      );
    });
  };

  const handleAddAddress = () => {
    if (address.trim() === '') {
      return;
    }
    db.transaction(
      tx => {
        tx.executeSql('INSERT INTO addresses (address) VALUES (?);', [address]);
      },
      null,
      updateList
    );
    setAddress('');
  };

  const handleAddressPress = (item) => {
    navigation.navigate('Map', { address: item.address });
  };

  const handleLongPress = (id) => {
    db.transaction(
      tx => {
        tx.executeSql('DELETE FROM addresses WHERE id = ?;', [id]);
      },
      null,
      updateList
    );
  };

  const renderItem = ({ item }) => (
    <ListItem onPress={() => handleAddressPress(item)} onLongPress={() => handleLongPress(item.id)} bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{item.address}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
      />
      <Button title="Add Address" onPress={handleAddAddress} />
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

function MapScreen({ route }) {
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
