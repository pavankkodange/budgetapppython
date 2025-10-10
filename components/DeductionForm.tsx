import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaxDeductions } from '@/context/TaxDeductionContext';
import { useCurrency } from '@/context/CurrencyProvider';
import { YearPicker } from './YearPicker';

const DEDUCTION_TYPES = [
  'Medical Expenses',
  'Charitable Contributions',
  'Home Mortgage Interest',
  'Education Expenses',
  'Retirement Contributions',
  'Property Taxes',
  'State and Local Taxes',
  'Business Expenses',
  'Investment Expenses',
  'Other'
];

interface DeductionFormProps {
  onSubmit: () => void;
  defaultYear?: number;
}

export function DeductionForm({ onSubmit, defaultYear = new Date().getFullYear() }: DeductionFormProps) {
  const { addTaxDeduction } = useTaxDeductions();
  const { selectedCurrency } = useCurrency();
  
  const [year, setYear] = useState<number>(defaultYear);
  const [deductionType, setDeductionType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showTypeSelector, setShowTypeSelector] = useState<boolean>(false);

  const handleSubmit = () => {
    // Validate inputs
    if (!deductionType) {
      Alert.alert('Error', 'Please select a deduction type');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Create deduction object
    const newDeduction = {
      year,
      deduction_type: deductionType,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
    };

    // Add deduction
    addTaxDeduction(newDeduction);
    
    // Reset form and close modal
    resetForm();
    onSubmit();
  };

  const resetForm = () => {
    setDeductionType('');
    setAmount('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tax Year</Text>
        <YearPicker
          selectedYear={year}
          onYearChange={setYear}
          containerStyle={styles.yearPickerContainer}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Deduction Type</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowTypeSelector(true)}
        >
          <Text style={deductionType ? styles.selectorText : styles.selectorPlaceholder}>
            {deductionType || 'Select deduction type'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Add details about this deduction"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Save Deduction</Text>
      </TouchableOpacity>

      {/* Type Selector Modal */}
      {showTypeSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Deduction Type</Text>
              <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.typeList}>
              {DEDUCTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.typeItem}
                  onPress={() => {
                    setDeductionType(type);
                    setShowTypeSelector(false);
                  }}
                >
                  <Text style={styles.typeItemText}>{type}</Text>
                  {deductionType === type && (
                    <Ionicons name="checkmark" size={20} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 8,
  },
  yearPickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  selectorPlaceholder: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  currencySymbol: {
    paddingLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  typeList: {
    maxHeight: 300,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
});