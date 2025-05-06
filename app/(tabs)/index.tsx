import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import SwipeableItem from 'react-native-swipeable-item';
import * as crypto from 'expo-crypto';
import {
  calculateCuts,
  type PieceRequirement,
  type Result,
  type SheetDimensions,
} from '@/lib/layout';
import { PieceItem } from '@/components/PieceItem';
import { ResultsSection } from '@/components/ResultsSection';

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

export default function Calculator() {
  const [mainSheet, setMainSheet] = useState<SheetDimensions>({
    width: 2500,
    height: 1250,
  });
  const [sheetQuantity, setSheetQuantity] = useState<number>(2);
  const lastPieceCount = useRef(4);
  const [pieces, setPieces] = useState<PieceRequirement[]>(() => [
    {
      id: crypto.randomUUID(),
      name: `Piece 1`,
      width: 1274,
      height: 1111,
      quantity: 2,
      color: COLORS[0],
    },
    {
      id: crypto.randomUUID(),
      name: `Piece 2`,
      width: 1480,
      height: 120,
      quantity: 4,
      color: COLORS[1],
    },
    {
      id: crypto.randomUUID(),
      name: `Piece 3`,
      width: 960,
      height: 128,
      quantity: 4,
      color: COLORS[2],
    },
  ]);
  const [result, setResult] = useState<Result | null>(null);

  const addPiece = () => {
    setPieces([
      ...pieces,
      {
        id: crypto.randomUUID(),
        name: `Piece ${lastPieceCount.current}`,
        width: 0,
        height: 0,
        quantity: 1,
        color: COLORS[pieces.length % COLORS.length],
      },
    ]);
    lastPieceCount.current += 1;
  };

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text className="font-bold" style={styles.sectionTitle}>
            Main Sheet Dimensions
          </Text>
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text className="mb-1" style={styles.label}>
                Width (mm)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={mainSheet.width.toString()}
                onChangeText={(text) =>
                  setMainSheet({ ...mainSheet, width: Number(text) })
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text className="mb-1" style={styles.label}>
                Height (mm)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={mainSheet.height.toString()}
                onChangeText={(text) =>
                  setMainSheet({ ...mainSheet, height: Number(text) })
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text className="mb-1" style={styles.label}>
                Quantity
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sheetQuantity.toString()}
                onChangeText={(text) =>
                  setSheetQuantity(Math.max(1, Number(text)))
                }
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.noPadding]}>
          <View className="px-4" style={styles.sectionHeader}>
            <Text className="mb-0.5" style={styles.sectionTitle}>
              Required Pieces
            </Text>
          </View>
          <Text className="px-4 mb-2" style={styles.sectionSubtitle}>
            Measurements in mm
          </Text>

          <View className="flex flex-row justify-between gap-2 px-4">
            <Text className="ml-6" style={[styles.label, styles.nameInput]}>
              Piece
            </Text>
            <Text style={[styles.label, styles.dimensionInput]}>Width</Text>
            <Text style={[styles.label, styles.dimensionInput]}>Height</Text>
            <Text style={[styles.label, styles.quantityInput]}>Qty</Text>
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
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={addPiece}
        >
          <Text style={styles.buttonText}>Add Piece</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() =>
            setResult(calculateCuts(mainSheet, pieces, sheetQuantity))
          }
        >
          <Text style={styles.buttonText}>Calculate Cuts</Text>
        </TouchableOpacity>

        {result && (
          <ResultsSection
            result={result}
            pieces={pieces}
            sheetQuantity={sheetQuantity}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  swipeableItemWrapper: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
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
  primaryButton: {
    backgroundColor: '#0891b2',
  },
  secondaryButton: {
    backgroundColor: '#64748b',
  },
  button: {
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
