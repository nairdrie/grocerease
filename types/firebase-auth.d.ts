// tell TS about the RN persistence helper that your build can see
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  /**
   * React-Native AsyncStorage–backed persistence driver
   * (available in the RN build of the SDK)
   */
  export function getReactNativePersistence(
    storage: unknown
  ): Persistence;
}
