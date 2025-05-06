import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import React from 'react';
import type { PieceRequirement, Result } from '@/lib/layout';

interface ResultsSectionProps {
  result: Result;
  pieces: PieceRequirement[];
  sheetQuantity: number;
}

export function ResultsSection({
  result,
  pieces,
  sheetQuantity,
}: ResultsSectionProps) {
  const { width: screenWidth } = useWindowDimensions();

  const renderDiagram = (sheetIndex: number) => {
    if (!result) return null;

    const PADDING = 20;
    const diagramWidth = screenWidth - PADDING * 2;
    const scale = diagramWidth / result.mainSheet.width;
    const diagramHeight = result.mainSheet.height * scale;

    const sheetPositions = result.layout.positions.filter(
      (p) => p.sheetIndex === sheetIndex,
    );

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
              fill={pieces.find((p) => p.id === pos.id)?.color}
              fillOpacity={0.3}
              stroke={pieces.find((p) => p.id === pos.id)?.color}
              strokeWidth="1"
            />
          ))}

          {/* Cut lines */}
          {Array.from(new Set(sheetPositions.map((p) => p.x)))
            .filter((x) => x > 0)
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
          {Array.from(new Set(sheetPositions.map((p) => p.y)))
            .filter((y) => y > 0)
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Results</Text>
      {Array.from({ length: sheetQuantity }).map((_, index) =>
        renderDiagram(index),
      )}
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>
          Total cuts needed: {result.layout.totalCuts}
        </Text>
        <Text style={styles.stat}>
          Total wasted area: {result.layout.wastedArea.toFixed(2)} mm² (
          {(
            (result.layout.wastedArea /
              (result.mainSheet.width *
                result.mainSheet.height *
                sheetQuantity)) *
            100
          ).toFixed(2)}
          %)
        </Text>
        <Text style={styles.stat}>
          Pieces placed: {result.layout.positions.length} of{' '}
          {pieces.reduce((sum, piece) => sum + piece.quantity, 0)}
        </Text>
        {result.layout.unusedPieces.length > 0 && (
          <View style={styles.unusedPiecesContainer}>
            <Text style={styles.unusedPiecesTitle}>Unused Pieces:</Text>
            {result.layout.unusedPieces.map(({ id, name, quantity }, index) => (
              <Text
                key={`${id}-${index}`}
                style={[
                  styles.unusedPiece,
                  { color: pieces.find((p) => p.id === id)?.color },
                ]}
              >
                • {name}: {quantity} remaining
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  section: {
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
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
