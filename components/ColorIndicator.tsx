import { View } from 'react-native';
import React from 'react';

export function ColorIndicator({ color }: { color: string }) {
  return (
    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
  );
}
