import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

type AdminTab = 'dashboard' | 'users' | 'errors' | 'agents' | 'settings';

interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'teen' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  logsCount: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  resolved: boolean;
}

interface AgentConfig {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

const MOCK_METRICS: MetricCard[] = [
  { label: 'Total Users', value: 156, change: '+12%', changeType: 'positive', icon: 'people', color: '#10B981' },
  { label: 'Active Today', value: 43, change: '+5%', changeType: 'positive', icon: 'pulse', color: '#3B82F6' },
  { label: 'Logs Today', value: 287, change: '+18%', changeType: 'positive', icon: 'document-text', color: '#8B5CF6' },
  { label: 'Avg Response', value: '1.2s', change: '-0.3s', changeType: 'positive', icon: 'timer', color: '#F59E0B' },
  { label: 'Error Rate', value: '0.3%', change: '+0.1%', changeType: 'negative', icon: 'warning', color: '#EF4444' },
  { label: 'Uptime', value: '99.9%', change: '0%', changeType: 'neutral', icon: 'checkmark-circle', color: '#10B981' },
];

const MOCK_USERS: UserData[] = [
  { id: '1', email: 'alex@example.com', name: 'Alex Johnson', role: 'teen', status: 'active', lastActive: '2 min ago', logsCount: 45 },
  { id: '2', email: 'sam@example.com', name: 'Sam Williams', role: 'teen', status: 'active', lastActive: '15 min ago', logsCount: 32 },
  { id: '3', email: 'jordan@example.com', name: 'Jordan Lee', role: 'teen', status: 'inactive', lastActive: '3 days ago', logsCount: 12 },
  { id: '4', email: 'admin@growthtrack.app', name: 'Admin User', role: 'admin', status: 'active', lastActive: 'Now', logsCount: 0 },
  { id: '5', email: 'taylor@example.com', name: 'Taylor Brown', role: 'teen', status: 'suspended', lastActive: '1 week ago', logsCount: 8 },
];

const MOCK_ERRORS: ErrorLog[] = [
  { id: '1', timestamp: '2026-02-04 05:30:12', type: 'error', message: 'API timeout on /api/recommendations', source: 'Backend', resolved: false },
  { id: '2', timestamp: '2026-02-04 05:15:44', type: 'warning', message: 'High memory usage detected (85%)', source: 'System', resolved: false },
  { id: '3', timestamp: '2026-02-04 04:52:18', type: 'error', message: 'Failed to sync HealthKit data', source: 'HealthKit', resolved: true },
  { id: '4', timestamp: '2026-02-04 04:30:00', type: 'info', message: 'Scheduled backup completed', source: 'Database', resolved: true },
  { id: '5', timestamp: '2026-02-04 03:45:22', type: 'warning', message: 'Rate limit approaching for external API', source: 'API', resolved: false },
];

const MOCK_AGENTS: AgentConfig[] = [
  {
    id: '1',
    name: 'Recommendations Agent',
    model: 'gpt-4o-mini',
    systemPrompt: 'You are a health recommendation assistant for teen athletes. Provide age-appropriate advice based on their logged health data including sleep, workouts, nutrition, and mental health. Always prioritize safety and encourage healthy habits.',
    temperature: 0.7,
    maxTokens: 500,
    isActive: true,
  },
  {
    id: '2',
    name: 'Morning Brief Agent',
    model: 'gpt-4o-mini',
    systemPrompt: 'Generate a personalized morning brief for the teen athlete. Include sleep quality analysis, readiness score, and top 3 recommendations for the day. Keep it motivating and actionable.',
    temperature: 0.8,
    maxTokens: 300,
    isActive: true,
  },
  {
    id: '3',
    name: 'Scoliosis PT Agent',
    model: 'gpt-4o',
    systemPrompt: 'You are a physical therapy assistant specializing in scoliosis management for teens. Provide exercise recommendations based on their brace wear time and PT session logs. Always recommend consulting with their healthcare provider for any concerns.',
    temperature: 0.5,
    maxTokens: 400,
    isActive: false,
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [errors, setErrors] = useState<ErrorLog[]>(MOCK_ERRORS);
  const [agents, setAgents] = useState<AgentConfig[]>(MOCK_AGENTS);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResetUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' as const, logsCount: 0 } : u));
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' as const : 'suspended' as const } : u));
  };

  const handleResolveError = (errorId: string) => {
    setErrors(errors.map(e => e.id === errorId ? { ...e, resolved: true } : e));
  };

  const handleToggleAgent = (agentId: string) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, isActive: !a.isActive } : a));
  };

  const handleUpdateAgentPrompt = (agentId: string, newPrompt: string) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, systemPrompt: newPrompt } : a));
  };

  const renderDashboard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.metricsGrid}>
        {MOCK_METRICS.map((metric, index) => (
          <Card key={index} style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
              <Ionicons name={metric.icon as never} size={24} color={metric.color} />
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            {metric.change ? (
              <Text style={[
                styles.metricChange,
                metric.changeType === 'positive' && styles.changePositive,
                metric.changeType === 'negative' && styles.changeNegative,
              ]}>
                {metric.change}
              </Text>
            ) : null}
          </Card>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quality Metrics</Text>
      <Card style={styles.qualityCard}>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>App Crash Rate</Text>
          <Text style={styles.qualityValue}>0.02%</Text>
        </View>
        <View style={styles.qualityBar}>
          <View style={[styles.qualityFill, { width: '98%', backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>API Success Rate</Text>
          <Text style={styles.qualityValue}>99.7%</Text>
        </View>
        <View style={styles.qualityBar}>
          <View style={[styles.qualityFill, { width: '99.7%', backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>User Satisfaction</Text>
          <Text style={styles.qualityValue}>4.6/5</Text>
        </View>
        <View style={styles.qualityBar}>
          <View style={[styles.qualityFill, { width: '92%', backgroundColor: '#3B82F6' }]} />
        </View>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>Data Sync Success</Text>
          <Text style={styles.qualityValue}>98.5%</Text>
        </View>
        <View style={styles.qualityBar}>
          <View style={[styles.qualityFill, { width: '98.5%', backgroundColor: '#10B981' }]} />
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Activity</Text>
      <Card style={styles.activityCard}>
        {[
          { action: 'New user registered', time: '5 min ago', icon: 'person-add' },
          { action: 'Workout logged', time: '12 min ago', icon: 'barbell' },
          { action: 'Mental health entry', time: '18 min ago', icon: 'leaf' },
          { action: 'Sleep data synced', time: '25 min ago', icon: 'moon' },
          { action: 'PT session completed', time: '42 min ago', icon: 'fitness' },
        ].map((activity, index) => (
          <View key={index} style={styles.activityRow}>
            <View style={styles.activityIcon}>
              <Ionicons name={activity.icon as never} size={18} color="#64748B" />
            </View>
            <Text style={styles.activityText}>{activity.action}</Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </Card>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.section}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.userStats}>
        <Card style={styles.userStatCard}>
          <Text style={styles.userStatValue}>{users.filter(u => u.status === 'active').length}</Text>
          <Text style={styles.userStatLabel}>Active</Text>
        </Card>
        <Card style={styles.userStatCard}>
          <Text style={styles.userStatValue}>{users.filter(u => u.status === 'inactive').length}</Text>
          <Text style={styles.userStatLabel}>Inactive</Text>
        </Card>
        <Card style={styles.userStatCard}>
          <Text style={styles.userStatValue}>{users.filter(u => u.status === 'suspended').length}</Text>
          <Text style={styles.userStatLabel}>Suspended</Text>
        </Card>
      </View>

      {filteredUsers.map((user) => (
        <Card key={user.id} style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={[
              styles.userStatus,
              user.status === 'active' && styles.statusActive,
              user.status === 'inactive' && styles.statusInactive,
              user.status === 'suspended' && styles.statusSuspended,
            ]}>
              <Text style={[
                styles.userStatusText,
                user.status === 'active' && styles.statusTextActive,
                user.status === 'inactive' && styles.statusTextInactive,
                user.status === 'suspended' && styles.statusTextSuspended,
              ]}>{user.status}</Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Role</Text>
              <Text style={styles.userDetailValue}>{user.role}</Text>
            </View>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Last Active</Text>
              <Text style={styles.userDetailValue}>{user.lastActive}</Text>
            </View>
            <View style={styles.userDetail}>
              <Text style={styles.userDetailLabel}>Total Logs</Text>
              <Text style={styles.userDetailValue}>{user.logsCount}</Text>
            </View>
          </View>
          {user.role !== 'admin' ? (
            <View style={styles.userActions}>
              <TouchableOpacity 
                style={styles.userActionBtn} 
                onPress={() => handleResetUser(user.id)}
              >
                <Ionicons name="refresh" size={16} color="#3B82F6" />
                <Text style={styles.userActionText}>Reset Data</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.userActionBtn, user.status === 'suspended' && styles.userActionBtnActive]} 
                onPress={() => handleSuspendUser(user.id)}
              >
                <Ionicons name={user.status === 'suspended' ? 'checkmark-circle' : 'ban'} size={16} color={user.status === 'suspended' ? '#10B981' : '#EF4444'} />
                <Text style={[styles.userActionText, { color: user.status === 'suspended' ? '#10B981' : '#EF4444' }]}>
                  {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Card>
      ))}
    </View>
  );

  const renderErrors = () => (
    <View style={styles.section}>
      <View style={styles.errorStats}>
        <Card style={[styles.errorStatCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={[styles.errorStatValue, { color: '#EF4444' }]}>{errors.filter(e => e.type === 'error' && !e.resolved).length}</Text>
          <Text style={styles.errorStatLabel}>Unresolved Errors</Text>
        </Card>
        <Card style={[styles.errorStatCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={[styles.errorStatValue, { color: '#F59E0B' }]}>{errors.filter(e => e.type === 'warning' && !e.resolved).length}</Text>
          <Text style={styles.errorStatLabel}>Warnings</Text>
        </Card>
        <Card style={[styles.errorStatCard, { borderLeftColor: '#10B981' }]}>
          <Text style={[styles.errorStatValue, { color: '#10B981' }]}>{errors.filter(e => e.resolved).length}</Text>
          <Text style={styles.errorStatLabel}>Resolved</Text>
        </Card>
      </View>

      {errors.map((error) => (
        <Card key={error.id} style={[styles.errorCard, error.resolved && styles.errorCardResolved]}>
          <View style={styles.errorHeader}>
            <View style={[
              styles.errorBadge,
              error.type === 'error' && styles.errorBadgeError,
              error.type === 'warning' && styles.errorBadgeWarning,
              error.type === 'info' && styles.errorBadgeInfo,
            ]}>
              <Ionicons 
                name={error.type === 'error' ? 'close-circle' : error.type === 'warning' ? 'warning' : 'information-circle'} 
                size={14} 
                color="#FFF" 
              />
              <Text style={styles.errorBadgeText}>{error.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.errorTimestamp}>{error.timestamp}</Text>
          </View>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <View style={styles.errorFooter}>
            <Text style={styles.errorSource}>Source: {error.source}</Text>
            {!error.resolved ? (
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolveError(error.id)}>
                <Ionicons name="checkmark" size={14} color="#10B981" />
                <Text style={styles.resolveBtnText}>Mark Resolved</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.resolvedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.resolvedText}>Resolved</Text>
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );

  const renderAgents = () => (
    <View style={styles.section}>
      <Text style={styles.agentIntro}>
        Configure AI agents that power recommendations and insights. Changes take effect immediately.
      </Text>

      {agents.map((agent) => (
        <Card key={agent.id} style={[styles.agentCard, !agent.isActive && styles.agentCardInactive]}>
          <View style={styles.agentHeader}>
            <View style={styles.agentTitleRow}>
              <Ionicons name="hardware-chip" size={20} color={agent.isActive ? '#8B5CF6' : '#94A3B8'} />
              <Text style={styles.agentName}>{agent.name}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.agentToggle, agent.isActive && styles.agentToggleActive]}
              onPress={() => handleToggleAgent(agent.id)}
            >
              <View style={[styles.agentToggleKnob, agent.isActive && styles.agentToggleKnobActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.agentMeta}>
            <View style={styles.agentMetaItem}>
              <Text style={styles.agentMetaLabel}>Model</Text>
              <Text style={styles.agentMetaValue}>{agent.model}</Text>
            </View>
            <View style={styles.agentMetaItem}>
              <Text style={styles.agentMetaLabel}>Temperature</Text>
              <Text style={styles.agentMetaValue}>{agent.temperature}</Text>
            </View>
            <View style={styles.agentMetaItem}>
              <Text style={styles.agentMetaLabel}>Max Tokens</Text>
              <Text style={styles.agentMetaValue}>{agent.maxTokens}</Text>
            </View>
          </View>

          <Text style={styles.agentPromptLabel}>System Prompt</Text>
          {editingAgent === agent.id ? (
            <View>
              <TextInput
                style={styles.agentPromptInput}
                value={agent.systemPrompt}
                onChangeText={(text) => handleUpdateAgentPrompt(agent.id, text)}
                multiline
                numberOfLines={6}
              />
              <TouchableOpacity 
                style={styles.savePromptBtn}
                onPress={() => setEditingAgent(null)}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
                <Text style={styles.savePromptText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingAgent(agent.id)}>
              <Text style={styles.agentPrompt} numberOfLines={4}>{agent.systemPrompt}</Text>
              <Text style={styles.editPromptHint}>Tap to edit</Text>
            </TouchableOpacity>
          )}
        </Card>
      ))}

      <Card style={styles.addAgentCard}>
        <TouchableOpacity style={styles.addAgentBtn}>
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.addAgentText}>Add New Agent</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Maintenance Mode</Text>
            <Text style={styles.settingDesc}>Temporarily disable app access for maintenance</Text>
          </View>
          <TouchableOpacity style={styles.settingToggle}>
            <View style={styles.settingToggleKnob} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Debug Logging</Text>
            <Text style={styles.settingDesc}>Enable verbose logging for debugging</Text>
          </View>
          <TouchableOpacity style={[styles.settingToggle, styles.settingToggleActive]}>
            <View style={[styles.settingToggleKnob, styles.settingToggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>API Rate Limit</Text>
            <Text style={styles.settingDesc}>Max requests per minute per user</Text>
          </View>
          <Text style={styles.settingValue}>60</Text>
        </View>
      </Card>

      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Data Retention</Text>
            <Text style={styles.settingDesc}>Days to keep user activity logs</Text>
          </View>
          <Text style={styles.settingValue}>90 days</Text>
        </View>
      </Card>

      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>App Version</Text>
            <Text style={styles.settingDesc}>Current deployed version</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </Card>

      <Card style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn}>
          <Ionicons name="trash" size={18} color="#EF4444" />
          <Text style={styles.dangerBtnText}>Clear All Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn}>
          <Ionicons name="refresh" size={18} color="#EF4444" />
          <Text style={styles.dangerBtnText}>Reset All User Data</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'analytics' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'errors', label: 'Errors', icon: 'warning' },
    { id: 'agents', label: 'AI Agents', icon: 'hardware-chip' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as never} size={18} color={activeTab === tab.id ? '#8B5CF6' : '#64748B'} />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'errors' && renderErrors()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'settings' && renderSettings()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshBtn: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: '#EDE9FE',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    color: '#64748B',
  },
  changePositive: {
    color: '#10B981',
  },
  changeNegative: {
    color: '#EF4444',
  },
  qualityCard: {
    padding: 16,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  qualityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  qualityBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  userStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  userStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  userCard: {
    marginBottom: 12,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  userStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusSuspended: {
    backgroundColor: '#FEE2E2',
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#10B981',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  statusTextSuspended: {
    color: '#EF4444',
  },
  userDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userDetail: {
    flex: 1,
  },
  userDetailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  userDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  userActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  userActionBtnActive: {
    backgroundColor: '#D1FAE5',
  },
  userActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  errorStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  errorStatCard: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },
  errorStatValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  errorStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  errorCard: {
    marginBottom: 12,
    padding: 14,
  },
  errorCardResolved: {
    opacity: 0.7,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  errorBadgeError: {
    backgroundColor: '#EF4444',
  },
  errorBadgeWarning: {
    backgroundColor: '#F59E0B',
  },
  errorBadgeInfo: {
    backgroundColor: '#3B82F6',
  },
  errorBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
  errorMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  errorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorSource: {
    fontSize: 12,
    color: '#64748B',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolveBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolvedText: {
    fontSize: 12,
    color: '#10B981',
  },
  agentIntro: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  agentCard: {
    marginBottom: 16,
    padding: 16,
  },
  agentCardInactive: {
    opacity: 0.6,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  agentToggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  agentToggleActive: {
    backgroundColor: '#8B5CF6',
  },
  agentToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  agentToggleKnobActive: {
    alignSelf: 'flex-end',
  },
  agentMeta: {
    flexDirection: 'row',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  agentMetaItem: {
    flex: 1,
  },
  agentMetaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  agentMetaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  agentPromptLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  agentPrompt: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  agentPromptInput: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editPromptHint: {
    fontSize: 11,
    color: '#8B5CF6',
    marginTop: 6,
  },
  savePromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  savePromptText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  addAgentCard: {
    padding: 0,
  },
  addAgentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addAgentText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  settingCard: {
    marginBottom: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  settingToggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  settingToggleActive: {
    backgroundColor: '#10B981',
  },
  settingToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  settingToggleKnobActive: {
    alignSelf: 'flex-end',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  dangerCard: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  dangerBtnText: {
    fontSize: 14,
    color: '#EF4444',
  },
});
