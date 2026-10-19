import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

function isOnline(state: { isConnected?: boolean; isInternetReachable?: boolean | null }): boolean {
  if (!state.isConnected) return false;
  return state.isInternetReachable !== false;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let alive = true;
    const apply = (state: { isConnected?: boolean; isInternetReachable?: boolean | null }) => {
      if (alive) setOnline(isOnline(state));
    };
    Network.getNetworkStateAsync().then(apply).catch(() => apply({ isConnected: false }));
    const sub = Network.addNetworkStateListener(apply);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return online;
}
