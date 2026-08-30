import { View, Text,StyleSheet } from 'react-native'
import React from 'react'

export default function TripsScreen() {
  return (
    <View style={styles.container}>
      <Text>TripsScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
});