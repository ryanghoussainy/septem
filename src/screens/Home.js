import { Divider } from "@rneui/themed";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { colours, masteryColours } from "../../constants/colours";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchSkills, groupSkillsById } from "../operations/Skills";
import {
  fetchUserActivity,
  groupActivityBySkillId,
} from "../operations/Activity";
import { fetchGoals, groupGoalsBySkillId } from "../operations/Goals";
import { useFocusEffect } from "@react-navigation/native";
import FancyDivider from "../components/FancyDivider";
import { fetchUser, updateUser } from "../operations/Users";
import { compareDates, EQ, LT } from "../dates/Dates";
import { icon_colours, icons } from "../../constants/streak_icon";
import Push from "../components/Push";
import { LinearGradient } from "expo-linear-gradient";

const BADGE_SIZE = 50;
const BADGE_MARGIN = 10; // Margin between badges

const Badge = ({ goal, achievedCount, skillName, isStretch }) => {
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
  };

  // Check if goal is achieved by comparing the number of achived goals to the mastery level
  const isGoalAchieved = goal.mastery <= achievedCount;

  // Check if goal is the next goal to achieve in a similar way
  const isNextGoal = goal.mastery === achievedCount + 1;

  // Actual badge component
  const _Badge = () => {
    return (
      <View
        style={[
          styles.badge,
          {
            borderColor: isGoalAchieved
              ? masteryColours[goal.mastery]
              : colours.cardBG,
          },
        ]}
      >
        <LinearGradient colors={[
          isGoalAchieved
            ? masteryColours[goal.mastery]
            : colours.cardBG,
          colours.bg
        ]} 
        style={styles.gradientContainer}>
          <Text style={styles.badgeText}>
            {isGoalAchieved || isNextGoal ? goal.code : "???"}
          </Text>
        </LinearGradient>
      </View>
    );
  };

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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={() => setBadgeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalTouchableContainer}
              activeOpacity={1}
              onPress={() => {
                /* Prevent closing modal when badge is pressed */
              }}
            >
              {/* Badge at the top */}
              <View style={styles.modalBadge}>
                <_Badge />
              </View>

              {/* Achievement name, mastery and target value */}
              <Text style={styles.modalText}>
                {isGoalAchieved || isNextGoal ? (
                  <Text>
                    {skillName + " "}
                    <Text
                      style={{
                        // Grey out colour if goal is not achieved
                        color: isGoalAchieved
                          ? masteryColours[goal.mastery]
                          : colours.subText,
                      }}
                    >
                      {nice_mastery(goal.mastery)}
                      {" mastery\n\n"}
                    </Text>

                    {"Complete "}
                    <Text
                      style={{
                        // Grey out colour if goal is not achieved
                        color: isGoalAchieved
                          ? masteryColours[goal.mastery]
                          : colours.subText,
                      }}
                    >
                      {!isStretch ? goal.target_value + " " : ""}
                    </Text>
                    {skillName}
                  </Text>
                ) : (
                  <Text style={{ color: "grey" }}>???</Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

const SkillAchievements = ({ goals, achievedCount, skillName, isStretch }) => {
  let { width } = useWindowDimensions();
  // Adjust for screen padding
  width -= 32;

  const badgesPerRow = Math.floor(width / (BADGE_SIZE + BADGE_MARGIN));
  const rows = [];

  for (let i = 0; i < goals.length; i += badgesPerRow) {
    rows.push(goals.slice(i, i + badgesPerRow));
  }

  return (
    <View>
      <FancyDivider title={skillName} />
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.badgeRow}>
          {row.map((goal) => {
            return (
              <Badge
                key={goal.id}
                goal={goal}
                achievedCount={achievedCount}
                skillName={skillName}
                isStretch={isStretch}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const SkillActivity = ({ skillName, activities }) => {
  // State to toggle open/close
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} activeOpacity={1}>
        <Text style={[styles.skillTitleTodayActivity]}>
          {isOpen ? "v " : "> "}
          {skillName}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.card}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.cardSideBySide}>
              {/* Display achieved value with a checkmark icon */}
              <View style={styles.achievedValueContainer}>
                <Ionicons name="checkmark-circle" size={20} />
                <Text>
                  {"  " +
                    (activity.is_stretch
                      ? activity.achieved_value == 0
                        ? "Not Completed"
                        : "Completed"
                      : activity.achieved_value) +
                    (activity.in_seconds ? "s" : "")}
                </Text>
              </View>

              {/* Display time in HH:MM */}
              <Text style={styles.cardText}>
                {new Date(activity.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const Streak = ({ streak, user, fetchData }) => {
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [iconColourModalVisible, setIconColourModalVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);

  let { width, height } = useWindowDimensions();

  const onSelectIcon = (icon) => {
    setSelectedIcon(icon);
    setIconColourModalVisible(true);
  }

  const onSelectColour = (colour) => {
    updateUser(user.id, {
      streak_icon_name: selectedIcon,
      streak_icon_colour: colour,
    })
    setIconColourModalVisible(false);
    setStreakModalVisible(false);

    fetchData();
  }

  return (
    <TouchableOpacity style={styles.streakContainer} onPress={() => setStreakModalVisible(true)}>
      <Ionicons name={user.streak_icon_name} size={24} color={user.streak_icon_colour} />
      <Text style={styles.streakText}>
        {streak}
      </Text>

      <Modal
        animationType="fade"
        transparent={true}
        visible={streakModalVisible}
        onRequestClose={() => setStreakModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={() => setStreakModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalTouchableContainer}
              activeOpacity={1}
              onPress={() => {
                /* Prevent closing modal when badge is pressed */
              }}
            >
              <ScrollView style={{ maxWidth: width * 0.7, maxHeight: height * 0.4 }} contentContainerStyle={styles.iconGrid}>
                {icons.map((icon) => (
                  <TouchableOpacity key={icon} onPress={() => onSelectIcon(icon)} style={styles.iconButton}>
                    <Ionicons name={icon} size={32} color={colours.text} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={iconColourModalVisible}
        onRequestClose={() => setIconColourModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={() => setIconColourModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalTouchableContainer}
              activeOpacity={1}
              onPress={() => {
                /* Prevent closing modal when badge is pressed */
              }}
            >
              <Text style={styles.modalText}>
                {icon_colours.map((colour) => (
                  <TouchableOpacity key={colour} onPress={() => onSelectColour(colour)} style={styles.iconButton}>
                    <Ionicons name={selectedIcon} size={32} color={colour} style={styles.iconButton} />
                  </TouchableOpacity>
                ))}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  )
}

const Home = ({ session }) => {
  const [groupedSkills, setGroupedSkills] = useState([]);
  const [groupedGoals, setGroupedGoals] = useState([]);
  const [user, setUser] = useState({});
  const [groupedTodayActivity, setGroupedTodayActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch the backend data
  const fetchData = async () => {
    // Fetch skill and group by id
    const skills = await fetchSkills();
    setGroupedSkills(groupSkillsById(skills));

    // Fetch all user activity
    const activity = await fetchUserActivity(session.user.id);

    // Filter today's activity
    const today = new Date();
    const todayActivity = activity.filter(
      (a) =>
        new Date(a.created_at).getDate() === today.getDate() &&
        new Date(a.created_at).getMonth() === today.getMonth() &&
        new Date(a.created_at).getFullYear() === today.getFullYear()
    );

    // Group today's activity by skill id
    const groupedTodayActivity = groupActivityBySkillId(todayActivity);
    setGroupedTodayActivity(groupedTodayActivity);

    // Group all activity by skill id
    const groupedActivity = groupActivityBySkillId(activity);

    // Fetch goals and group by skill id
    const goals = await fetchGoals();
    setGroupedGoals(groupGoalsBySkillId(goals, groupedActivity));

    // Fetch user from users table
    const _user = await fetchUser(session.user.id);
    setUser(_user);

    // Convert last_acted to a date object
    const lastActed = new Date(_user.last_acted);

    // Get the date 1 day before today
    const todayMinusOne = new Date();
    todayMinusOne.setDate(todayMinusOne.getDate() - 1);

    // Get the date 2 days before today
    const todayMinusTwo = new Date();
    todayMinusTwo.setDate(todayMinusTwo.getDate() - 2);

    // Function to reset streak
    const resetStreak = async () => {
      await updateUser(session.user.id, {
        last_acted: null,
        streak: 0,
        has_skip: false,
      });
    };

    if (_user.last_acted != null) {
      if (compareDates(lastActed, todayMinusTwo) === EQ) {
        if (_user.has_skip) {
          // Use the skip
          await updateUser(session.user.id, {
            last_acted: todayMinusOne.toISOString(),
            has_skip: false,
            streak: _user.streak + 1,
          })
        } else {
          // Reset streak
          await resetStreak();
        }
      } else if (compareDates(lastActed, todayMinusTwo) === LT) {
        // Reset streak
        await resetStreak();
      }
    }
  };

  // Fetch data when user navigates to the screen
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Fetch data when the screen is first loaded
  useEffect(() => {
    fetchData();

    setLoading(false);
  }, []);

  // Loading screen
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colours.text} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Septem</Text>

        {/* Streak */}
        <Streak streak={user.streak} user={user} fetchData={fetchData}/>
      </View>

      {/* Today's activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's activity</Text>

        {Object.keys(groupedTodayActivity).length > 0 ? (
          Object.keys(groupedTodayActivity).map((skillId) => (
            <SkillActivity
              key={skillId}
              skillName={groupedSkills[skillId].name}
              activities={groupedTodayActivity[skillId]}
            />
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
        {groupedGoals.map(([skillId, { achievedCount, goals }]) => (
          <SkillAchievements
            key={skillId}
            goals={goals}
            achievedCount={achievedCount}
            skillName={groupedSkills[skillId].name}
            isStretch={groupedSkills[skillId].is_stretch}
          />
        ))}
      </View>

      <Push session={session} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg,
    padding: 16,
    paddingTop: 40,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  divider: {
    marginVertical: 10,
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colours.greyButtonBG,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colours.text,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: colours.text,
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
    fontWeight: "500",
  },
  cardSideBySide: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 2,
  },
  badgeText: {
    color: colours.text,
    textAlign: "center",
    lineHeight: 50,
    fontWeight: "bold",
    transform: [{ translateY: -2 }], // Adjust height
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colours.bg,
    borderRadius: 8,
    elevation: 5,
  },
  modalTouchableContainer: {
    padding: 20,
    paddingTop: 30,
  },
  modalText: {
    color: colours.text,
    fontSize: 16,
  },
  modalBadge: {
    position: "absolute",
    top: -BADGE_SIZE / 2,
    alignSelf: "center",
  },
  achievedValueContainer: {
    flexDirection: "row",
  },
  skillTitleTodayActivity: {
    color: colours.black,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  streakContainer: {
    alignItems: "center",
  },
  streakText: {
    color: colours.text,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconButton: {
    margin: 10,
  },
});

export default Home;
