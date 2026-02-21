import { Capacitor } from '@capacitor/core';

/**
 * Detect if the app is running as a native iOS app (via Capacitor)
 */
export const isNativeIOS = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

/**
 * Detect if the app is running as a native Android app (via Capacitor)
 */
export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Detect if the app is running natively (iOS or Android)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Detect if the app is running in a web browser
 */
export const isWebPlatform = (): boolean => {
  return !Capacitor.isNativePlatform();
};
