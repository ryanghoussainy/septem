import { Divider } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { colours, masteryColours } from '../constants/colours';

const dummyData = [
    {
        id: 1,
        is_goal_achieved: true,
        mastery: 1,
        name: "Pushups",
        is_stretch: false,
        target_value: 20,
        code: "PU-I",
    },
    {
        id: 3,
        is_goal_achieved: true,
        mastery: 3,
        name: "Pushups",
        is_stretch: false,
        target_value: 60,
        code: "PU-III",
    },
    {
        id: 4,
        is_goal_achieved: true,
        mastery: 4,
        name: "Pushups",
        is_stretch: false,
        target_value: 80,
        code: "PU-IV",
    },
    {
        id: 5,
        is_goal_achieved: true,
        mastery: 5,
        name: "Pushups",
        is_stretch: false,
        target_value: 100,
        code: "PU-V",
    },
    {
        id: 6,
        is_goal_achieved: true,
        mastery: 6,
        name: "Pushups",
        is_stretch: false,
        target_value: 150,
        code: "PU-VI",
    },
    {
        id: 7,
        is_goal_achieved: true,
        mastery: 7,
        name: "Pushups",
        is_stretch: false,
        target_value: 200,
        code: "PU-VII",
    },
    {
        id: 8,
        is_goal_achieved: true,
        mastery: 1,
        name: "The Splits",
        is_stretch: true,
        target_value: 1,
        code: "SPL",
    },
    {
        id: 9,
        is_goal_achieved: true,
        mastery: 1,
        name: "Pull ups",
        is_stretch: false,
        target_value: 5,
        code: "PLU-I",
    },
    {
        id: 2,
        is_goal_achieved: true,
        mastery: 2,
        name: "Pushups",
        is_stretch: false,
        target_value: 40,
        code: "PU-II",
    },
    {
        id: 10,
        is_goal_achieved: false,
        mastery: 2,
        name: "Pull ups",
        is_stretch: false,
        target_value: 10,
        code: "PLU-II",
    },
    {
        id: 11,
        is_goal_achieved: false,
        mastery: 3,
        name: "Pull ups",
        is_stretch: false,
        target_value: 20,
        code: "PLU-III",
    },
    {
        id: 12,
        is_goal_achieved: false,
        mastery: 4,
        name: "Pull ups",
        is_stretch: false,
        target_value: 30,
        code: "PLU-IV",
    },
    {
        id: 13,
        is_goal_achieved: false,
        mastery: 5,
        name: "Pull ups",
        is_stretch: false,
        target_value: 40,
        code: "PLU-V",
    },
    {
        id: 14,
        is_goal_achieved: false,
        mastery: 6,
        name: "Pull ups",
        is_stretch: false,
        target_value: 50,
        code: "PLU-VI",
    },
    {
        id: 15,
        is_goal_achieved: false,
        mastery: 7,
        name: "Pull ups",
        is_stretch: false,
        target_value: 70,
        code: "PLU-VII",
    },
]

const groupBySkill = (data) => {
    const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.name]) {
            acc[curr.name] = [];
        }
        acc[curr.name].push(curr);
        return acc;
    }, {});

    // Sort each skill by mastery
    for (const skill in grouped) {
        grouped[skill].sort((a, b) => a.mastery - b.mastery);
    }
    return grouped;
};

const Badge = ({ isAchieved, code, mastery, isNextGoal }) => {
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: isAchieved ? masteryColours[mastery] : colours.cardBG },
            ]}
        >
            <Text style={styles.badgeText}>{isAchieved || isNextGoal ? code : '???'}</Text>
        </View>
    );
};

const SkillAchievements = ({ skill, achievements }) => {
    let { width } = useWindowDimensions();
    // Adjust for screen padding
    width -= 32;

    const badgesPerRow = Math.floor(width / 60);
    const rows = [];

    let nextGoalFound = false;

    for (let i = 0; i < achievements.length; i += badgesPerRow) {
        rows.push(achievements.slice(i, i + badgesPerRow));
    }

    return (
        <View style={styles.skillContainer}>
            <Text style={styles.skillTitle}>{skill}</Text>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.badgeRow}>
                    {row.map((achievement) => {
                        const isNextGoal = !achievement.is_goal_achieved && !nextGoalFound;
                        if (isNextGoal) {
                            nextGoalFound = true;
                        }
                        return <Badge
                            key={achievement.id}
                            isAchieved={achievement.is_goal_achieved}
                            code={achievement.code}
                            mastery={achievement.mastery}
                            isNextGoal={isNextGoal}
                        />
                    })}
                </View>
            ))}

            <Divider style={styles.divider} />
        </View>
    );
};

const Home = () => {
    const groupedAchievements = groupBySkill(dummyData);
    
    return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Septem</Text>
        </View>

        {/* Today's activity */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's activity</Text>

            <View style={styles.card}>
                <Text style={styles.cardText}>No activity today</Text>
            </View>
        </View>

        <Divider style={styles.divider} />

        {/* Achievements */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {Object.entries(groupedAchievements).map(([skill, achievements]) => (
                <SkillAchievements key={skill} skill={skill} achievements={achievements} />
            ))}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg,
    padding: 16,
    paddingTop: 40,
  },
  divider: {
    marginVertical: 10,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colours.buttonBG,
    borderRadius: 8,
  },
  title: {
    color: colours.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colours.text,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colours.subText,
  },
  card: {
    backgroundColor: colours.cardBG,
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  badgeText: {
    color: colours.text,
    textAlign: 'center',
    lineHeight: 50,
    fontWeight: 'bold',
  },
});

export default Home;
