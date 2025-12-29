import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads an image from a local URI to Firebase Storage
 * @param uri Local file URI from image picker
 * @param path Storage path (e.g., 'avatars/uid.jpg')
 * @returns The public download URL
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
