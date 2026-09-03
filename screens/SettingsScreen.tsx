import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={25}
            color="#12213D"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Settings
        </Text>

      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile */}
        <View style={styles.profileCard}>

          <View style={styles.profileIcon}>
            <Ionicons
              name="person"
              size={27}
              color="#F2A93B"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Jean Claude
            </Text>

            <Text style={styles.profilePhone}>
              +250 788 123 456
            </Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons
              name="create-outline"
              size={16}
              color="#0E7C86"
            />

            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>
          ACCOUNT
        </Text>

        <View style={styles.sectionCard}>

          <TouchableOpacity style={styles.row} onPress={() => router.push('/saved-locations')}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Personal Information
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Password & Security
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>
          PREFERENCES
        </Text>

        <View style={styles.sectionCard}>

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Notifications
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="globe-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Language
            </Text>

            <Text style={styles.value}>
              English
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Location Access
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

        </View>

        {/* TRANSPORT */}
        <Text style={styles.sectionTitle}>
          TRANSPORT
        </Text>

        <View style={styles.sectionCard}>

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="navigate-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Favorite Routes
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => router.push('/saved-locations')}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="bookmark-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Saved Locations
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

        </View>

        {/* SUPPORT */}
        <Text style={styles.sectionTitle}>
          SUPPORT
        </Text>

        <View style={styles.sectionCard}>

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Help Center
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="headset-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              Contact Support
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#12213D"
              />
            </View>

            <Text style={styles.rowText}>
              About TEGA Bus
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#AAB2BF"
            />
          </TouchableOpacity>

        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#C24444"
          />

          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Version 1.0.0 (MVP)
        </Text>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  /* Header */

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF0',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#12213D',
    marginLeft: 15,
  },

  /* Scroll */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* Profile */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#12213D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B2233',
  },

  profilePhone: {
    fontSize: 13,
    color: '#5B6478',
    marginTop: 3,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0E7C86',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  editText: {
    color: '#0E7C86',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },

  /* Sections */

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B6478',
    marginBottom: 8,
    marginLeft: 2,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 22,
  },

  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF1F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rowText: {
    flex: 1,
    fontSize: 15,
    color: '#1B2233',
    fontWeight: '500',
  },

  value: {
    fontSize: 13,
    color: '#5B6478',
    marginRight: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#E7EAF0',
    marginLeft: 62,
  },
  logoutButton: {
    height: 52,
    backgroundColor: '#FBE9E9',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C24444',
    marginLeft: 7,
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9AA3B5',
  },

});