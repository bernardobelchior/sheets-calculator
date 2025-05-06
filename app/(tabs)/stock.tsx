import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import SwipeableItem from 'react-native-swipeable-item';
import React, { useRef, useState } from 'react';
import type { PieceRequirement } from '@/lib/layout';
import * as crypto from 'expo-crypto';
import { Trash2 } from 'lucide-react-native';
import { PieceItem } from '@/components/PieceItem';

export interface StockedPiece {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  color: string;
}

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export default function Stock() {
  const [pieces, setPieces] = useState<StockedPiece[]>(() => [
    {
      id: crypto.randomUUID(),
      name: `Stocked Piece 1`,
      width: 1274,
      height: 1111,
      quantity: 2,
      color: COLORS[0],
    },
  ]);
  const lastPieceCount = useRef(pieces.length);

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const updatePiece = (index: number, updates: Partial<PieceRequirement>) => {
    setPieces(
      pieces.map((piece, i) =>
        i === index ? { ...piece, ...updates } : piece,
      ),
    );
  };

  const addPiece = () => {
    setPieces([
      ...pieces,
      {
        id: crypto.randomUUID(),
        name: `Stocked Piece ${lastPieceCount.current}`,
        width: 0,
        height: 0,
        quantity: 1,
        color: COLORS[pieces.length % COLORS.length],
      },
    ]);
    lastPieceCount.current += 1;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex flex-row justify-between gap-2 px-4">
          <Text className="ml-6 flex-1" style={styles.label}>
            Piece
          </Text>
          <Text className="min-w-[72px]" style={styles.label}>
            Width
          </Text>
          <Text className="min-w-[72px]" style={styles.label}>
            Height
          </Text>
          <Text className="min-w-12" style={styles.label}>
            Qty
          </Text>
        </View>
        {pieces.map((piece, index) => (
          <View key={piece.id} className="mt-2 flex-1">
            <SwipeableItem
              item={piece}
              renderUnderlayLeft={() => (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    paddingRight: 24,
                  }}
                  onPress={() => removePiece(index)}
                >
                  <Trash2 size={24} color="#fff" />
                </TouchableOpacity>
              )}
              snapPointsLeft={[80]}
            >
              <PieceItem
                className="px-4"
                piece={piece}
                index={index}
                onUpdate={updatePiece}
              />
            </SwipeableItem>
          </View>
        ))}

        <TouchableOpacity
          className="p-4 mx-2 rounded-lg items-center mt-4 mb-4 bg-[#64748b]"
          onPress={addPiece}
        >
          <Text className="text-white text-base font-bold">Add Piece</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#64748b',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
});
