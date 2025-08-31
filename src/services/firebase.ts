import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export async function signUpWithEmail(email: string, password: string) {
  const cred = await auth().createUserWithEmailAndPassword(email, password);
  return cred.user;
}

export async function uploadUserImage(uid: string, localUri: string) {
  // Store avatar under users/{uid}/avatar.jpg
  const ref = storage().ref(`users/${uid}/avatar.jpg`);
  // RNFB Storage accepts a file path; ensure uri is a file path
  const task = ref.putFile(localUri);
  await task;
  return await ref.getDownloadURL();
}

export async function createOrUpdateUserProfile(uid: string, data: Record<string, any>) {
  const userDoc = firestore().collection('users').doc(uid);
  await userDoc.set(
    {
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
