import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { Plus, Trash2 } from 'lucide-react-native';
import { calculateCuts, type PieceRequirement, type SheetDimensions } from '@/lib/layout';


interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  pieceIndex: number;
  sheetIndex: number;
}

interface CutResult {
  mainSheet: SheetDimensions;
  pieces: PieceRequirement[];
  layout: {
    positions: Position[];
    wastedArea: number;
    totalCuts: number;
    unusedPieces: { pieceIndex: number; quantity: number }[];
  };
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

export default function Calculator() {
  const [mainSheet, setMainSheet] = useState<SheetDimensions>({
    width: 0,
    height: 0,
  });
  const [sheetQuantity, setSheetQuantity] = useState<number>(1);
  const [pieces, setPieces] = useState<PieceRequirement[]>([
    { width: 0, height: 0, quantity: 1, color: COLORS[0] },
  ]);
  const [result, setResult] = useState<CutResult | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const addPiece = () => {
    setPieces([
      ...pieces,
      {
        width: 0,
        height: 0,
        quantity: 1,
        color: COLORS[pieces.length % COLORS.length],
      },
    ]);
  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const updatePiece = (index: number, updates: Partial<PieceRequirement>) => {
    setPieces(
      pieces.map((piece, i) =>
        i === index ? { ...piece, ...updates } : piece
      )
    );
  };

  const renderDiagram = (sheetIndex: number) => {
    if (!result) return null;

    const PADDING = 20;
    const diagramWidth = screenWidth - (PADDING * 2);
    const scale = diagramWidth / result.mainSheet.width;
    const diagramHeight = result.mainSheet.height * scale;

    const sheetPositions = result.layout.positions.filter(p => p.sheetIndex === sheetIndex);

    return (
      <View style={styles.diagramContainer} key={sheetIndex}>
        <Text style={styles.sheetTitle}>Sheet {sheetIndex + 1}</Text>
        <Svg width={diagramWidth} height={diagramHeight}>
          {/* Main sheet outline */}
          <Rect
            x={0}
            y={0}
            width={diagramWidth}
            height={diagramHeight}
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />

          {/* Pieces */}
          {sheetPositions.map((pos, index) => (
            <Rect
              key={index}
              x={pos.x * scale}
              y={pos.y * scale}
              width={pos.width * scale}
              height={pos.height * scale}
              fill={result.pieces[pos.pieceIndex].color}
              fillOpacity={0.3}
              stroke={result.pieces[pos.pieceIndex].color}
              strokeWidth="1"
            />
          ))}

          {/* Cut lines */}
          {Array.from(new Set(sheetPositions.map(p => p.x)))
            .filter(x => x > 0)
            .map((x, i) => (
              <Line
                key={`v${i}`}
                x1={x * scale}
                y1={0}
                x2={x * scale}
                y2={diagramHeight}
                stroke="#ff0000"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
          {Array.from(new Set(sheetPositions.map(p => p.y)))
            .filter(y => y > 0)
            .map((y, i) => (
              <Line
                key={`h${i}`}
                x1={0}
                y1={y * scale}
                x2={diagramWidth}
                y2={y * scale}
                stroke="#ff0000"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
        </Svg>
      </View>
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
          <Text style={styles.sectionTitle}>Main Sheet Dimensions</Text>
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Width (mm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={mainSheet.width.toString()}
                onChangeText={(text) => setMainSheet({ ...mainSheet, width: Number(text) })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (mm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={mainSheet.height.toString()}
                onChangeText={(text) => setMainSheet({ ...mainSheet, height: Number(text) })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sheetQuantity.toString()}
                onChangeText={(text) => setSheetQuantity(Math.max(1, Number(text)))}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Required Pieces</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPiece}>
              <Plus size={24} color="#0891b2" />
            </TouchableOpacity>
          </View>
          {pieces.map((piece, index) => (
            <View key={index} style={styles.pieceContainer}>
              <View style={styles.pieceHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: piece.color }]} />
                <Text style={styles.pieceTitle}>Piece {index + 1}</Text>
                {pieces.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePiece(index)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Width (mm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={piece.width.toString()}
                    onChangeText={(text) =>
                      updatePiece(index, { width: Number(text) })
                    }
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Height (mm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={piece.height.toString()}
                    onChangeText={(text) =>
                      updatePiece(index, { height: Number(text) })
                    }
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={piece.quantity.toString()}
                    onChangeText={(text) =>
                      updatePiece(index, { quantity: Math.max(1, Number(text)) })
                    }
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={() => setResult(calculateCuts(mainSheet, pieces, sheetQuantity))}>
          <Text style={styles.buttonText}>Calculate Cuts</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            {Array.from({ length: sheetQuantity }).map((_, index) => renderDiagram(index))}
            <View style={styles.statsContainer}>
              <Text style={styles.stat}>Total cuts needed: {result.layout.totalCuts}</Text>
              <Text style={styles.stat}>
                Total wasted area: {result.layout.wastedArea.toFixed(2)} mm²
                ({((result.layout.wastedArea / (result.mainSheet.width * result.mainSheet.height * sheetQuantity)) * 100).toFixed(2)}%)
              </Text>
              <Text style={styles.stat}>
                Pieces placed: {result.layout.positions.length} of{' '}
                {pieces.reduce((sum, piece) => sum + piece.quantity, 0)}
              </Text>
              {result.layout.unusedPieces.length > 0 && (
                <View style={styles.unusedPiecesContainer}>
                  <Text style={styles.unusedPiecesTitle}>Unused Pieces:</Text>
                  {result.layout.unusedPieces.map(({ pieceIndex, quantity }) => (
                    <Text key={pieceIndex} style={[styles.unusedPiece, { color: pieces[pieceIndex].color }]}>
                      • Piece {pieceIndex + 1}: {quantity} remaining
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#64748b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diagramContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  statsContainer: {
    gap: 8,
  },
  stat: {
    fontSize: 16,
    color: '#334155',
  },
  addButton: {
    padding: 8,
  },
  pieceContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  pieceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pieceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  unusedPiecesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  unusedPiecesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  unusedPiece: {
    fontSize: 14,
    marginLeft: 8,
  },
});