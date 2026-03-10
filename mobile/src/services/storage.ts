import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

/**
 * Uploads an image from a local URI to Supabase Storage
 * @param uri Local file URI from image picker
 * @param path Storage path (e.g., 'avatars/uid.jpg')
 * @returns The public download URL
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
    try {
        // Expo FileSystem to read the file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        // Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64);

        // Upload to Supabase Storage (Bucket name: 'images' or 'avatars')
        // We use 'avatars' as requested by the path
        const bucket = 'avatars';
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image to Supabase:', error);
        throw error;
    }
};
