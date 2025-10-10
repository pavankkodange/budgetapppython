import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { TaxDeduction } from '@/types';

interface DeductionCardProps {
  deduction: TaxDeduction;
  currencySymbol: string;
  onPress?: () => void;
}

export function DeductionCard({ deduction, currencySymbol, onPress }: DeductionCardProps) {
  // Determine icon based on deduction type
  const getDeductionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical expenses':
        return 'medkit-outline';
      case 'charitable contributions':
        return 'heart-outline';
      case 'home mortgage interest':
        return 'home-outline';
      case 'education expenses':
        return 'school-outline';
      case 'retirement contributions':
        return 'wallet-outline';
      default:
        return 'receipt-outline';
    }
  };

  const iconName = getDeductionIcon(deduction.deduction_type);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={20} color="#ffffff" />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{deduction.deduction_type}</Text>
          <Text style={styles.amount}>{currencySymbol}{deduction.amount.toLocaleString()}</Text>
        </View>
        
        {deduction.description && (
          <Text style={styles.description} numberOfLines={2}>
            {deduction.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            Added on {format(new Date(deduction.createdAt), 'MMM dd, yyyy')}
          </Text>
          
          {deduction.attachments && deduction.attachments.length > 0 && (
            <View style={styles.attachmentBadge}>
              <Ionicons name="document-attach-outline" size={12} color="#4f46e5" />
              <Text style={styles.attachmentText}>
                {deduction.attachments.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: '#4f46e5',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4f46e5',
    marginLeft: 4,
  },
});