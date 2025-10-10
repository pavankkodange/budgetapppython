import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YearPickerProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  startYear?: number;
  endYear?: number;
  containerStyle?: ViewStyle;
}

export function YearPicker({
  selectedYear,
  onYearChange,
  startYear = 2010,
  endYear = new Date().getFullYear() + 5,
  containerStyle,
}: YearPickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Generate array of years
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse(); // Most recent years first

  return (
    <>
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.yearText}>{selectedYear}</Text>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.yearItem,
                    selectedYear === item && styles.selectedYearItem,
                  ]}
                  onPress={() => {
                    onYearChange(item);
                    setIsModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      selectedYear === item && styles.selectedYearItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedYear === item && (
                    <Ionicons name="checkmark" size={20} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={years.findIndex(year => year === selectedYear)}
              getItemLayout={(data, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  yearItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedYearItem: {
    backgroundColor: '#ede9fe',
  },
  yearItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  selectedYearItemText: {
    fontFamily: 'Inter-Medium',
    color: '#4f46e5',
  },
});