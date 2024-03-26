import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { ListItem } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';


export default function PlacesScreen({ navigation }) {
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const db = SQLite.openDatabase('addresses.db');
    
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
  