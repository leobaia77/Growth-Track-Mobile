import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, ConfirmDialog } from '@/components/ui';
import { api } from '@/services/api';

type ExportFormat = 'json' | 'csv';

export default function DataExportScreen() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [showExportReadyDialog, setShowExportReadyDialog] = useState(false);
  const [showEmailSentDialog, setShowEmailSentDialog] = useState(false);
  const [showDownloadReadyDialog, setShowDownloadReadyDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exportResponse, setExportResponse] = useState<unknown>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.request(`/api/data-export?format=${selectedFormat}`);
      setExportResponse(response);
      setShowExportReadyDialog(true);
    } catch (error) {
      setErrorMessage("We couldn't export your data right now. Please try again later or contact support.");
      setShowErrorDialog(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailExport = async () => {
    setShowExportReadyDialog(false);
    try {
      await api.request('/api/data-export/email', { method: 'POST', body: { format: selectedFormat } });
      setShowEmailSentDialog(true);
    } catch (error) {
      setErrorMessage('Failed to send email. Please try again.');
      setShowErrorDialog(true);
    }
  };

  const handleDownload = () => {
    setShowExportReadyDialog(false);
    setShowDownloadReadyDialog(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Export My Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Ionicons name="download" size={32} color="#10B981" />
          <Text style={styles.infoTitle}>Download Your Data</Text>
          <Text style={styles.infoText}>
            Export all your GrowthTrack data in a portable format. This includes your profile, health logs, goals, and settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <Card style={styles.dataList}>
            <View style={styles.dataItem}>
              <Ionicons name="person" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Profile information</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="bed" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Sleep logs</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="fitness" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Workout logs</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="nutrition" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Nutrition logs</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="happy" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Daily check-ins</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="medical" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Scoliosis care data</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="flag" size={20} color="#10B981" />
              <Text style={styles.dataItemText}>Goals and preferences</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatOptions}>
            <TouchableOpacity
              style={[styles.formatOption, selectedFormat === 'json' ? styles.formatOptionSelected : undefined]}
              onPress={() => setSelectedFormat('json')}
              accessibilityLabel="JSON format"
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedFormat === 'json' }}
            >
              <View style={[styles.radio, selectedFormat === 'json' ? styles.radioSelected : undefined]}>
                {selectedFormat === 'json' ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>JSON</Text>
                <Text style={styles.formatDescription}>Best for importing into other apps</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatOption, selectedFormat === 'csv' ? styles.formatOptionSelected : undefined]}
              onPress={() => setSelectedFormat('csv')}
              accessibilityLabel="CSV format"
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedFormat === 'csv' }}
            >
              <View style={[styles.radio, selectedFormat === 'csv' ? styles.radioSelected : undefined]}>
                {selectedFormat === 'csv' ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>CSV</Text>
                <Text style={styles.formatDescription}>Opens in Excel or Google Sheets</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, isExporting ? styles.exportButtonDisabled : undefined]}
          onPress={handleExport}
          disabled={isExporting}
          accessibilityLabel="Export data"
          accessibilityRole="button"
        >
          {isExporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-download" size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export My Data</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Your export will be generated securely. This may take a few moments depending on how much data you have.
        </Text>

        <View style={styles.footerSpace} />
      </ScrollView>

      <ConfirmDialog
        visible={showExportReadyDialog}
        title="Export Ready"
        message="Your data has been prepared. Would you like to receive it via email?"
        confirmText="Email Me"
        cancelText="Cancel"
        onConfirm={handleEmailExport}
        onCancel={() => setShowExportReadyDialog(false)}
        destructive={false}
      />

      <ConfirmDialog
        visible={showEmailSentDialog}
        title="Email Sent"
        message="Your data export has been sent to your registered email address."
        confirmText="OK"
        cancelText="Close"
        onConfirm={() => setShowEmailSentDialog(false)}
        onCancel={() => setShowEmailSentDialog(false)}
        destructive={false}
      />

      <ConfirmDialog
        visible={showDownloadReadyDialog}
        title="Download Ready"
        message="In a production build, this would save the file to your device. Your data export is ready."
        confirmText="OK"
        cancelText="Close"
        onConfirm={() => setShowDownloadReadyDialog(false)}
        onCancel={() => setShowDownloadReadyDialog(false)}
        destructive={false}
      />

      <ConfirmDialog
        visible={showErrorDialog}
        title="Export Failed"
        message={errorMessage}
        confirmText="OK"
        cancelText="Close"
        onConfirm={() => setShowErrorDialog(false)}
        onCancel={() => setShowErrorDialog(false)}
        destructive={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  infoBox: {
    backgroundColor: '#E8F5F0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  dataList: {
    padding: 0,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  dataItemText: {
    fontSize: 15,
    color: '#374151',
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  formatOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF9',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#10B981',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  formatDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  exportButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  footerSpace: {
    height: 40,
  },
});
