import React from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { Colors, HORIZONTAL_PADDING, isSmallScreen, isLargeScreen, PROJECT_TYPES } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { Folder, Plus, Waves, Thermometer, Map, Layers } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';

const CARD_WIDTH = isSmallScreen ? 120 : isLargeScreen ? 160 : 140;
const CARD_HEIGHT = 170;

const typeIcons: Record<string, any> = {
  gpr: Waves,
  ert: Thermometer,
  topo: Map,
  mixed: Layers,
};

interface ProjectCardProps {
  project: any;
  onPress: () => void;
  onLongPress: () => void;
}

function ProjectCard({ project, onPress, onLongPress }: ProjectCardProps) {
  const Icon = typeIcons[project.type] || Folder;
  const typeLabel = PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]?.label || '';

  return (
    <ScalePressable
      scale={0.96}
      haptic="light"
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.iconCircle}>
        <Icon size={24} color={Colors.gold.main} strokeWidth={2} />
      </View>
      <Text style={styles.projectName} numberOfLines={2}>{project.name}</Text>
      <Text style={styles.projectType}>{typeLabel}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
      </View>
    </ScalePressable>
  );
}

interface AddProjectCardProps {
  onPress: () => void;
}

function AddProjectCard({ onPress }: AddProjectCardProps) {
  return (
    <ScalePressable
      scale={0.96}
      style={styles.addCard}
      onPress={onPress}
    >
      <View style={styles.addCircle}>
        <Plus size={24} color={Colors.gold.main} strokeWidth={2} />
      </View>
      <Text style={styles.addText}>مشروع جديد</Text>
    </ScalePressable>
  );
}

interface ProjectsSectionProps {
  onViewAll: () => void;
  onProjectPress: (project: any) => void;
  onProjectLongPress: (project: any) => void;
  onAddProject: () => void;
}

export function ProjectsSection({
  onViewAll,
  onProjectPress,
  onProjectLongPress,
  onAddProject,
}: ProjectsSectionProps) {
  const { data } = useData();
  const hasProjects = data.projects.length > 0;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  React.useEffect(() => {
    opacity.value = withDelay(400, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(400, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  return (
    <Animated.View style={animStyle}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>المشاريع النشطة</Text>
          {hasProjects && (
            <ScalePressable scale={0.96} onPress={onViewAll}>
              <Text style={styles.viewAll}>عرض الكل ←</Text>
            </ScalePressable>
          )}
        </View>

        {hasProjects ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {data.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => onProjectPress(project)}
                onLongPress={() => onProjectLongPress(project)}
              />
            ))}
            <AddProjectCard onPress={onAddProject} />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Folder size={48} color={Colors.text.dark} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>لا توجد مشاريع بعد</Text>
            <Text style={styles.emptySubtitle}>ابدأ مشروعك الأول</Text>
            <ScalePressable
              scale={0.96}
              haptic="medium"
              style={styles.createButton}
              onPress={onAddProject}
            >
              <Plus size={18} color={Colors.gold.main} strokeWidth={2} />
              <Text style={styles.createButtonText}>أنشئ مشروعاً</Text>
            </ScalePressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 12,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  viewAll: {
    color: Colors.gold.main,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: Colors.background.cardLight,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 12,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    textAlign: 'left',
  },
  projectType: {
    color: Colors.text.tertiary,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border.subtle,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold.main,
    borderRadius: 2,
  },
  addCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: Colors.gold.main,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.gold.transparent,
    borderWidth: 1,
    borderColor: Colors.gold.border,
    marginTop: 8,
  },
  createButtonText: {
    color: Colors.gold.main,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
  },
});
