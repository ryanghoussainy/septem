import { Divider } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { colours, masteryColours } from '../constants/colours';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

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

const dummyTodayActivity = [
    {
        id: 1,
        name: "Pushups",
        is_stretch: false,
        created_at: "2021-09-01T10:00:00Z",
        achieved_value: 20,
    },
    {
        id: 2,
        name: "Pull ups",
        is_stretch: false,
        created_at: "2021-09-01T10:30:00Z",
        achieved_value: 5,
    },
    {
        id: 3,
        name: "The Splits",
        is_stretch: true,
        created_at: "2021-09-01T11:05:23Z",
        achieved_value: 0,
    },
    {
        id: 4,
        name: "Pushups",
        is_stretch: false,
        created_at: "2021-09-01T11:04:20Z",
        achieved_value: 25,
    },
    {
        id: 5,
        name: "Pushups",
        is_stretch: false,
        created_at: "2021-09-01T12:00:00Z",
        achieved_value: 2,
    },
]

const BADGE_SIZE = 50;
const BADGE_MARGIN = 10; // Margin between badges

const groupBySkill = (data) => {
    const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.name]) {
            acc[curr.name] = { achievements: [], achievedCount: 0 };
        }
        acc[curr.name].achievements.push(curr);
        if (curr.is_goal_achieved) {
            acc[curr.name].achievedCount += 1;
        }
        return acc;
    }, {});

    // Sort each skill by mastery
    for (const skill in grouped) {
        grouped[skill].achievements.sort((a, b) => a.mastery - b.mastery);
    }

    // Sort the skills by the number of achievements achieved
    const sortedGrouped = Object.entries(grouped).sort((a, b) => b[1].achievedCount - a[1].achievedCount);

    return sortedGrouped;
};

const Badge = ({ achievement, isNextGoal }) => {
    // Modal for badge details
    const [badgeModalVisible, setBadgeModalVisible] = useState(false);

    // Function to convert mastery level to a nice string
    const nice_mastery = (mastery) => {
        switch (mastery) {
            case 1:
                return "1st";
            case 2:
                return "2nd";
            case 3:
                return "3rd";
            default:
                return `${mastery}th`;
        }
    }

    // Actual badge component
    const _Badge = () => {
        return (
            <View
                style={[
                    styles.badge,
                    { backgroundColor: achievement.is_goal_achieved ? 
                        masteryColours[achievement.mastery] : colours.cardBG 
                    },
                ]}
            >
                <Text style={styles.badgeText}>{achievement.is_goal_achieved || isNextGoal ? achievement.code : '???'}</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity onPress={() => setBadgeModalVisible(true)}>
            <_Badge />

            {/* Badge details modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={badgeModalVisible}
                onRequestClose={() => setBadgeModalVisible(false)}
            >
                <TouchableOpacity activeOpacity={1} style={styles.badgeModalContainer} onPress={() => setBadgeModalVisible(false)}>
                    <View style={styles.badgeModalContent}>
                        <TouchableOpacity style={styles.badgeModalTouchableContainer} activeOpacity={1} onPress={() => { /* Prevent closing modal when badge is pressed */ }}>
                            {/* Badge at the top */}
                            <View style={styles.badgeModalBadge}>
                                <_Badge />
                            </View>

                            {/* Achievement name, mastery and target value */}
                            <Text style={styles.badgeModalText}>
                                {achievement.is_goal_achieved || isNextGoal ? (
                                    <Text>
                                        {achievement.name + ' '}
                                        <Text style={{
                                            // Grey out colour if goal is not achieved
                                            color: achievement.is_goal_achieved ? masteryColours[achievement.mastery] : colours.subText
                                        }}>
                                            {
                                                nice_mastery(achievement.mastery)
                                            }
                                        {' mastery\n\n'}
                                        </Text>

                                        {'Complete '}
                                        <Text style={{
                                            // Grey out colour if goal is not achieved
                                            color: achievement.is_goal_achieved ? masteryColours[achievement.mastery] : colours.subText
                                        }}>
                                            {!achievement.is_stretch ? achievement.target_value + ' ' : ''}
                                        </Text>
                                        {achievement.name}
                                    </Text>
                                ) : (
                                    <Text style={{ color: "grey" }}
                                    >
                                        ???
                                    </Text>
                                )}
                            </Text>
                            
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </TouchableOpacity>
    );
};

const SkillAchievements = ({ skill, achievements }) => {
    let { width } = useWindowDimensions();
    // Adjust for screen padding
    width -= 32;

    const badgesPerRow = Math.floor(width / (BADGE_SIZE + BADGE_MARGIN));
    const rows = [];

    let nextGoalFound = false;

    for (let i = 0; i < achievements.length; i += badgesPerRow) {
        rows.push(achievements.slice(i, i + badgesPerRow));
    }

    return (
        <View>
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
                            achievement={achievement}
                            isNextGoal={isNextGoal}
                        />
                    })}
                </View>
            ))}

            <Divider style={styles.divider} />
        </View>
    );
};

const groupTodayActivityBySkill = (data) => {
    const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.name]) {
            acc[curr.name] = []
        }
        acc[curr.name].push(curr);
        return acc;
    }, {});

    // Sort each skill by time
    for (const skill in grouped) {
        grouped[skill].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return grouped;
}

const SkillActivity = ({ skill, activities }) => {
    // State to toggle open/close
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} activeOpacity={1}>
                <Text style={styles.cardText}>{isOpen ? 'v ' : '> '}{skill}</Text>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.card}>
                    {activities.map((activity) => (
                        <View key={activity.id} style={styles.cardSideBySide}>
                            {/* Display achieved value with a checkmark icon */}
                            <View style={styles.achievedValueContainer}>
                                <Ionicons name="checkmark-circle" size={20} />
                                <Text>{'  ' + (activity.is_stretch ? (activity.achieved_value == 0 ? "Not Completed" : "Completed") : activity.achieved_value)}</Text>
                            </View>
                            
                            {/* Display time in HH:MM */}
                            <Text style={styles.cardText}>{new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const Home = () => {
    const groupedAchievements = groupBySkill(dummyData);

    const groupedTodayActivity = groupTodayActivityBySkill(dummyTodayActivity);
    
    return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Septem</Text>
        </View>

        {/* Today's activity */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's activity</Text>

            {dummyTodayActivity ? (
                Object.keys(groupedTodayActivity).map((skill) => (
                    <SkillActivity key={skill} skill={skill} activities={groupedTodayActivity[skill]} />
                ))
            ) : (
                <View style={styles.card}>
                    <Text style={styles.cardText}>No activity today</Text>
                </View>
            )}
        </View>

        <Divider style={styles.divider} />

        {/* Achievements */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {groupedAchievements.map(([skill, { achievements }]) => (
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
  cardSideBySide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    marginHorizontal: 5,
  },
  badgeText: {
    color: colours.text,
    textAlign: 'center',
    lineHeight: 50,
    fontWeight: 'bold',
  },
  badgeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  badgeModalContent: {
    backgroundColor: colours.bg,
    borderRadius: 8,
    elevation: 5,
  },
  badgeModalTouchableContainer: {
    padding: 20,
    paddingTop: 30,
  },
  badgeModalText: {
    color: colours.text,
    fontSize: 16,
  },
  badgeModalBadge: {
    position: 'absolute',
    top: -BADGE_SIZE / 2,
    alignSelf: 'center',
  },
  achievedValueContainer: {
    flexDirection: 'row',
  },
});

export default Home;
