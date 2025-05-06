import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import type { PieceRequirement } from '@/lib/layout';
import { ColorIndicator } from '@/components/ColorIndicator';
import { pie } from '@lucide/lab';

interface PieceItemProps {
  className?: string;
  piece: PieceRequirement;
  index: number;
  onUpdate: (index: number, updates: Partial<PieceRequirement>) => void;
}

export const PieceItem = ({
  className,
  piece,
  index,
  onUpdate,
}: PieceItemProps) => {
  return (
    <View className={'px-1.5 bg-white ' + (className ?? '')}>
      <View className="flex flex-row items-center gap-2">
        <View className="flex flex-1 flex-row items-center gap-2">
          <ColorIndicator color={piece.color} />
          <TextInput
            style={[styles.input, styles.nameInput]}
            keyboardType="default"
            value={piece.name}
            onChangeText={(text) => onUpdate(index, { name: text })}
          />
        </View>
        <TextInput
          style={[styles.input, styles.dimensionInput]}
          keyboardType="numeric"
          value={piece.width.toString()}
          onChangeText={(text) => onUpdate(index, { width: Number(text) })}
        />
        <TextInput
          style={[styles.input, styles.dimensionInput]}
          keyboardType="numeric"
          value={piece.height.toString()}
          onChangeText={(text) => onUpdate(index, { height: Number(text) })}
        />
        <TextInput
          style={[styles.input, styles.quantityInput]}
          keyboardType="numeric"
          value={piece.quantity.toString()}
          onChangeText={(text) =>
            onUpdate(index, {
              quantity: Math.max(1, Number(text)),
            })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  nameInput: {
    flex: 1,
  },
  dimensionInput: {
    minWidth: 72,
  },
  quantityInput: {
    minWidth: 48,
  },
});
