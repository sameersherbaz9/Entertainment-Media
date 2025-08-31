import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, TextInput, Text, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { signUpWithEmail, uploadUserImage, createOrUpdateUserProfile } from './src/services/firebase';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      const user = await signUpWithEmail(email.trim(), password);
      await createOrUpdateUserProfile(user.uid, { email: user.email ?? email.trim() });
      Alert.alert('Registration', 'User registered successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    if (res.didCancel) return;
    const asset = res.assets?.[0];
    if (asset?.uri) {
      setAvatarUri(asset.uri);
    }
  };

  const onUpload = async () => {
    try {
      if (!avatarUri) return Alert.alert('Pick Image', 'Please select an image first');
      setLoading(true);
      // For iOS, uri may begin with file://; for Android, content:// works with RNFB putFile
      // RNFB putFile supports both file:// and content://
      const uidEmail = email.trim();
      if (!uidEmail) return Alert.alert('Missing Email', 'Enter email (used only to create user)');
      const user = await signUpWithEmail(uidEmail, password || 'password123');
      const url = await uploadUserImage(user.uid, avatarUri);
      await createOrUpdateUserProfile(user.uid, { avatarURL: url });
      setDownloadUrl(url);
      Alert.alert('Upload', 'Image uploaded successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text style={styles.title}>Petzgram Firebase Demo</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Working…' : 'Register'}</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      <TouchableOpacity style={styles.secondaryButton} onPress={onPickImage}>
        <Text style={styles.secondaryText}>Pick Image</Text>
      </TouchableOpacity>

      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <Text style={styles.hint}>No image selected</Text>
      )}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onUpload} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Uploading…' : 'Upload Image'}</Text>
      </TouchableOpacity>

      {downloadUrl ? (
        <Text selectable style={styles.link}>
          Uploaded URL: {downloadUrl}
        </Text>
      ) : null}
      <Text style={styles.footnote}>Platform: {Platform.OS}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 48,
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#4f46e5', padding: 12, borderRadius: 10, alignItems: 'center' },
  secondaryText: { color: '#4f46e5', fontWeight: '600' },
  preview: { width: '100%', height: 220, borderRadius: 12, marginVertical: 12 },
  hint: { color: '#777', marginVertical: 8 },
  link: { marginTop: 12, color: '#111' },
  footnote: { marginTop: 24, color: '#666', fontSize: 12 },
});

export default App;
