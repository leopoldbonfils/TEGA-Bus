import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
export default function SavedLocationsScreen() {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#4D5662"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Saved Locations
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Home */}
        <View style={styles.locationCard}>

          <View style={styles.locationTop}>

            <View style={styles.locationIcon}>
              <Ionicons
                name="home"
                size={20}
                color="#063B70"
              />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>
                Home
              </Text>

              <Text style={styles.locationAddress}>
                Downtown Kigali, St 42
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            <TouchableOpacity>
              <Ionicons
                name="pencil"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons
                name="trash-outline"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Work */}
        <View style={styles.locationCard}>

          <View style={styles.locationTop}>

            <View style={styles.locationIcon}>
              <Ionicons
                name="briefcase"
                size={20}
                color="#063B70"
              />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>
                Work
              </Text>

              <Text style={styles.locationAddress}>
                Kigali Heights, Kimihurura
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            <TouchableOpacity>
              <Ionicons
                name="pencil"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons
                name="trash-outline"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Favorite */}
        <View style={styles.locationCard}>

          <View style={styles.locationTop}>

            <View style={styles.locationIcon}>
              <Ionicons
                name="star"
                size={21}
                color="#00843D"
              />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>
                Favorite
              </Text>

              <Text style={styles.locationAddress}>
                Nyabugogo Bus Park
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            <TouchableOpacity>
              <Ionicons
                name="pencil"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons
                name="trash-outline"
                size={21}
                color="#4D5662"
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Add New Location Placeholder */}
        <TouchableOpacity
          style={styles.addLocation}
          onPress={() => {
            // Placeholder for adding a new location
          }}
        >

          <View style={styles.addIcon}>
            <Ionicons
              name="location-outline"
              size={27}
              color="#4D5662"
            />

            <View style={styles.plus}>
              <Ionicons
                name="add"
                size={12}
                color="#4D5662"
              />
            </View>
          </View>

          <Text style={styles.addText}>
            Add New Location
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  /* Header */
  header: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C9D0DB',
    paddingHorizontal: 18,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
    fontSize: 20,
    fontWeight: '700',
    color: '#14283F',
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },

  /* Location cards */
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD2DC',
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
  },

  locationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: '#E3EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  locationDetails: {
    flex: 1,
  },

  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14283F',
    marginBottom: 5,
  },

  locationAddress: {
    fontSize: 14,
    color: '#555D68',
  },

  divider: {
    height: 1,
    backgroundColor: '#D9E5F5',
    marginTop: 15,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 22,
    paddingTop: 12,
    paddingRight: 4,
  },

  /* Add location */
  addLocation: {
    height: 122,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C9D0DC',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },

  addIcon: {
    position: 'relative',
    marginBottom: 8,
  },

  plus: {
    position: 'absolute',
    right: -7,
    top: -5,
    backgroundColor: '#F5F7FC',
  },

  addText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#505865',
  },
});