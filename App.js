import React, { } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';

import MapScreen from './screens/Map';
import PlacesScreen from './screens/Places';

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
