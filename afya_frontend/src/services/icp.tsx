import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from '../utils/backend.did.js';
import { BackendService } from '@/types/actor.js';

interface HostConfig {
  host: string;
  canisterId: string;
}

interface UserRegistration {
  id: string;
  username: string;
  email: string;
}

// Singleton actor instance
let actor: BackendService | null = null;

/**
 * Determine the host and canister ID based on environment
 */
const getHostAndCanisterId = (): HostConfig => {
  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV !== 'production';
  
  if (isDevelopment) {
    return {
      host: "http://127.0.0.1:4943",  
      canisterId: process.env.NEXT_PUBLIC_CANISTER_ID ?? 'aaaaa-aa'
    };
  }
  
  return {
    host: 'https://icp0.io',  
    canisterId: process.env.NEXT_PUBLIC_CANISTER_ID ?? 'a4tbr-q4aaa-aaaaa-qaafq-cai'
  };
};

/**
 * Create or retrieve the actor instance
 */
export const createActor = async (): Promise<BackendService> => {
  try {
    if (actor) return actor;

    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    if (!identity.getPrincipal().isAnonymous()) {
      const { host, canisterId } = getHostAndCanisterId();
      
      const agent = new HttpAgent({
        host,
        identity,
      });

      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        await agent.fetchRootKey().catch((err: Error) => {
          console.warn('Unable to fetch root key:', err);
          throw new Error('Failed to fetch root key');
        });
      }

      actor = Actor.createActor<BackendService>(idlFactory, {
        agent,
        canisterId,
      });

      if (actor) {
        return actor;
      }
      throw new Error('Actor creation failed');
    }
    
    throw new Error('No authenticated identity found');
  } catch (error) {
    console.error('Failed to create actor:', error);
    throw new Error('Actor creation failed');
  }
};

/**
 * Register the user via Internet Identity
 */
export const register = async (username: string, email: string): Promise<boolean> => {
  try {
    const authClient = await AuthClient.create();

    return new Promise<boolean>((resolve, reject) => {
      const identityProvider = process.env.NEXT_PUBLIC_NODE_ENV !== 'production'
        ? `http://127.0.0.1:4943?canisterId=${process.env.NEXT_PUBLIC_II_CANISTER_ID}`
        : 'https://identity.ic0.app';

      authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        onSuccess: async () => {
          try {
            actor = null; // Reset actor to force re-creation
            const actorInstance = await createActor();
            const identity = authClient.getIdentity();
            const principal: string = identity.getPrincipal().toText();

            console.log('Registration successful:', {
              principal,
              username,
              email,
            });

            const result = await actorInstance.registerUser({
              id: principal,
              username,
              email
            });

            if ('Ok' in result) {
              resolve(true);
            } else {
              console.error('Registration failed:', result.Err);
              resolve(false);
            }
          } catch (error) {
            console.error('Post-login processing failed:', error);
            resolve(false);
          }
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve(false);
        },
      });
    });
  } catch (error) {
    console.error('Login process failed:', error);
    return false;
  }
};

/**
 * Log in the user via Internet Identity
 */
export const login = async (): Promise<boolean> => {
  try {
    const authClient = await AuthClient.create();

    return new Promise<boolean>((resolve, reject) => {
      const identityProvider = process.env.NEXT_PUBLIC_NODE_ENV !== 'production'
        ? `http://127.0.0.1:4943?canisterId=${process.env.NEXT_PUBLIC_II_CANISTER_ID}`
        : 'https://identity.ic0.app';

      authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        onSuccess: async () => {
          try {
            actor = null; // Reset actor to force re-creation
            const actorInstance = await createActor();
            const identity = authClient.getIdentity();
            const principal: string = identity.getPrincipal().toText();

            console.log('Login successful:', {
              principal,
            });

            const result = await actorInstance.loginUser(
              principal,
            );

            if ('Ok' in result) {
              resolve(true);
            } else {
              console.error('Registration failed:', result.Err);
              resolve(false);
            }
          } catch (error) {
            console.error('Post-login processing failed:', error);
            resolve(false);
          }
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve(false);
        },
      });
    });
  } catch (error) {
    console.error('Login process failed:', error);
    return false;
  }
};


/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    const authClient = await AuthClient.create();
    await authClient.logout();
    actor = null;
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('Logout failed');
  }
};

/**
 * Get the current user's principal
 */
export const getPrincipal = async (): Promise<{ principal: { toText: () => string } } | null> => {
  try {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    if (identity.getPrincipal().isAnonymous()) {
      return null;
    }

    return {
      principal: { toText: () => identity.getPrincipal().toText() }
    };
  } catch (error) {
    console.error('Failed to get principal:', error);
    return null;
  }
};


/**
 * Verify if the user is authenticated with Internet Identity
 * @returns Promise<boolean> true if authenticated, false otherwise
 */
export const verifyIdentity = async (): Promise<boolean> => {
    try {
      const authClient = await AuthClient.create();
      
      // Check if user is authenticated
      const isAuthenticated = await authClient.isAuthenticated();
      
      if (!isAuthenticated) {
        return false;
      }
  
      // Get the identity and check if it's anonymous
      const identity = authClient.getIdentity();
      if (identity.getPrincipal().isAnonymous()) {
        return false;
      }
  
      // Verify the validity of the identity
      try {
        await createActor(); // This will throw if the identity is invalid
        return true;
      } catch (error) {
        console.error('Failed to validate identity with actor:', error);
        return false;
      }
    } catch (error) {
      console.error('Identity verification failed:', error);
      return false;
    }
  };
