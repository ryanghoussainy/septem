import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colours, masteryColours } from '../../constants/colours';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HeavyButton from '../components/HeavyButton';
import { fetchGoals, getMaxAchievedValue, groupGoalsBySkillId } from '../operations/Goals';
import { useFocusEffect } from '@react-navigation/native';
import { deleteMostRecentActivity, fetchUserActivity, groupActivityBySkillId, logActivity } from '../operations/Activity';
import { fetchSkills, groupSkillsById } from '../operations/Skills';
import { compareDates, EQ } from '../dates/Dates';
import { fetchUser, updateUser } from '../operations/Users';
import { Ionicons } from '@expo/vector-icons';


const ProgressBar = ({
    skillId,
    userId,
    skillName,
    goals,
    onLogPress,
    activities,
    isStretch,
    inSeconds,
    justLoggedActivity,
    setJustLoggedActivity,
    fetchData,
}) => {
    const achievedValue = activities ? getMaxAchievedValue(activities) : 0;

    // Find the highest achieved goal and the lowest non-achieved goal
    let highestAchievedGoal = null;
    let lowestNonAchievedGoal = null;
    for (let i = 0; i < goals.length; i++) {
        if (achievedValue >= goals[i].target_value) {
            highestAchievedGoal = goals[i];
        } else {
            lowestNonAchievedGoal = goals[i];
            break;
        }
    }

    let progress = 0;
    let progressColor = colours.cardBG;
    let startValue = 0;
    let endValue = 0;

    if (!highestAchievedGoal) {
        // Case 1: Achieved value is between 0 and the first target
        startValue = 0;
        endValue = goals[0].target_value;
        progress = (achievedValue / endValue) * 100;
        progressColor = colours.darkgrey;
    } else if (!lowestNonAchievedGoal) {
        // Case 2: Achieved value is greater or equal to the highest target
        startValue = highestAchievedGoal.target_value;
        endValue = highestAchievedGoal.target_value;
        progress = 100;
        progressColor = masteryColours[highestAchievedGoal.mastery];
    } else {
        // Case 3: Achieved value is between two targets
        startValue = highestAchievedGoal.target_value;
        endValue = lowestNonAchievedGoal.target_value;
        progress = ((achievedValue - startValue) / (endValue - startValue)) * 100;
        progressColor = masteryColours[highestAchievedGoal.mastery];
    }

    // Adjust progress bar for a minimum of 1% width
    progress = Math.max(progress, 1);

    return (
        <View style={styles.progressBarContainer}>
            <View style={styles.sideBySide}>
                <Text style={styles.skillTitle}>{skillName}</Text>
                {justLoggedActivity && justLoggedActivity.skillId === skillId && (
                    <TouchableOpacity
                        onPress={async () => {
                            // Get warning confirmation 
                            const confirm = await new Promise((resolve) => {
                                Alert.alert(
                                    "Undo last activity",
                                    "Are you sure you want to undo the last activity you logged?",
                                    [
                                        {
                                            text: "Cancel",
                                            onPress: () => resolve(false),
                                            style: "cancel",
                                        },
                                        { text: "OK", onPress: () => resolve(true) },
                                    ]
                                );
                            });
                            if (!confirm) return;

                            // Delete the last logged activity
                            await deleteMostRecentActivity(userId, skillId);

                            // Reset the just logged activity
                            setJustLoggedActivity(null);

                            // Refresh data
                            fetchData();
                        }}
                    >
                        <Ionicons name="arrow-undo" size={24} color={colours.redButtonBG} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={[
                styles.progressText,
                { left: `${progress}%`, color: progressColor, transform: [{ translateX: -progress / 2 }] }
            ]}>
                {isStretch ?
                    "" : inSeconds ?
                    repsToTimeStr(achievedValue) :
                    achievedValue
                }
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            <View style={styles.progressBarLabels}>
                <Text>
                    {isStretch ? 
                        "Not Completed" : inSeconds ? 
                        repsToTimeStr(startValue) : 
                        startValue
                    }
                </Text>
                <Text>
                    {isStretch ? 
                        "Completed" : inSeconds ?
                        repsToTimeStr(endValue) : 
                        endValue
                    }
                </Text>
            </View>
            <HeavyButton
                title="Log"
                onPress={() => onLogPress(skillId)}
                color={colours.greyButtonBG}
                borderColor={colours.primaryButtonBorder}
                style={styles.logButton}
            />
        </View>
    );
};

const repsToTime = (reps) => {
    const minutes = Math.floor(reps / 60);
    const seconds = reps % 60;
    return { minutes, seconds };
};

const repsToTimeStr = (reps) => {
    const { minutes, seconds } = repsToTime(reps);
    return seconds === 0 ? `${minutes}min` : `${minutes}min ${seconds}s`;
};

const LogModal = ({
    user,
    skillId,
    visible,
    onClose,
    previousValue,
    groupedSkills,
    setJustLoggedActivity,
}) => {
    // Extract skill details
    const skillName = groupedSkills[skillId].name;
    const isStretch = groupedSkills[skillId].is_stretch;
    const inSeconds = groupedSkills[skillId].in_seconds;
    
    // Initialise state based on goal type
    const [completed, setCompleted] = useState(previousValue >= 1);
    const { minutes: initialMinutes, seconds: initialSeconds } = repsToTime(previousValue);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);
    const [reps, setReps] = useState(previousValue);

    // Loading state for logging
    const [loading, setLoading] = useState(false);

    const handleLog = async () => {
        // Log the goal based on its type
        let value = 0;
        if (isStretch) {
            // Case 1: Stretch is logged as a boolean (completed / not completed)
            value = completed ? 1 : 0;
        } else if (inSeconds) {
            // Case 2: Time goals are logged in seconds
            value = minutes * 60 + seconds;
        } else {
            // Case 3: Reps are logged
            value = reps;
        }

        // Log the goal
        setLoading(true);
        const success = await logActivity(user.id, skillId, value);
        if (success) {
            // Set the just logged activity for the user to be able to undo
            setJustLoggedActivity({ skillId, value });
        }

        // Close the modal
        onClose();

        setLoading(false);

        // Streak logic
        if (success) {
            // Get the user's last acted date and streak
            const lastActed = new Date(user.last_acted);
            const streak = user.streak;
            
            // Get today's date
            const today = new Date();
            
            // Initialise new values
            let updates = {};

            // If the user hasn't acted today, increment the streak
            if (compareDates(lastActed, today) !== EQ) {
                updates = {
                    last_acted: today.toISOString(),
                    streak: streak + 1,
                    has_skip: false,
                };
            }

            // If the achieved value is greater than the previous value, the user gains a skip
            if (value > previousValue) {
                updates = {
                    ...updates,
                    has_skip: true,
                }
            }

            // Update the user's information
            await updateUser(user.id, updates);
        }
    };

    if (loading) {
        return (
            <Modal visible transparent animationType="fade">
                <View style={styles.logModalContainer}>
                    <ActivityIndicator size="large" color={colours.primaryButtonBG} />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <TouchableOpacity activeOpacity={1} style={styles.logModalContainer} onPress={onClose}>
                <View style={styles.logModalContent}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.logModalTouchableContainer}>
                        <Text style={styles.logModalTitle}>{skillName}</Text>
                        {isStretch ? (
                            <View>
                                <Text style={styles.logModalSubText}>Did you complete it?</Text>
                                <Picker 
                                    style={styles.picker}
                                    dropdownIconColor={colours.subText}
                                    selectedValue={completed}
                                    onValueChange={(itemValue) => setCompleted(itemValue)}
                                >
                                    <Picker.Item label="No" value={false} />
                                    <Picker.Item label="Yes" value={true} />
                                </Picker>
                            </View>
                        ) : inSeconds ? (
                            <View>
                                <Text style={styles.logModalSubText}>Minutes</Text>
                                <Picker
                                    style={styles.picker}
                                    dropdownIconColor={colours.subText}
                                    selectedValue={minutes}
                                    onValueChange={(itemValue) => setMinutes(itemValue)}
                                    
                                >
                                    {[...Array(60).keys()].map((i) => (
                                        <Picker.Item key={i} label={`${i}`} value={i} />
                                    ))}
                                </Picker>
                                <Text style={styles.logModalSubText}>Seconds</Text>
                                <Picker
                                    style={styles.picker}
                                    dropdownIconColor={colours.subText}
                                    selectedValue={seconds}
                                    onValueChange={(itemValue) => setSeconds(itemValue)}
                                >
                                    {[...Array(60).keys()].map((i) => (
                                        <Picker.Item key={i} label={`${i}`} value={i} />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.logModalSubText}>Reps</Text>
                                <Picker 
                                    style={styles.picker}
                                    dropdownIconColor={colours.subText}
                                    selectedValue={reps}
                                    onValueChange={(itemValue) => setReps(itemValue)}
                                >
                                    {[...Array(501).keys()].map((i) => (
                                        <Picker.Item key={i} label={`${i}`} value={i} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                        <HeavyButton
                            onPress={handleLog}
                            title="Log"
                            style={styles.logModalButton}
                            color={colours.primaryButtonBG}
                            borderColor={colours.primaryButtonBorder}
                        />
                        <HeavyButton
                            onPress={onClose}
                            title="Close"
                            style={styles.logModalButton}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const Goals = ({ session }) => {
    const [groupedSkills, setGroupedSkills] = useState([]);
    const [groupedGoals, setGroupedGoals] = useState([]);
    const [groupedActivity, setGroupedActivity] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [logModalVisible, setLogModalVisible] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState(null);

    /* Activity just logged by the user. This gets reset if the user closes the app.
       This allows the user to undo the last activity they logged. */
    const [justLoggedActivity, setJustLoggedActivity] = useState(null);

    const fetchData = async () => {
        // Fetch skills
        const skills = await fetchSkills();
        setGroupedSkills(groupSkillsById(skills));

        // Fetch activity
        const activity = await fetchUserActivity(session.user.id);
        const groupedActivity = groupActivityBySkillId(activity);
        setGroupedActivity(groupedActivity);

        // Fetch goals
        const goals = await fetchGoals();
        setGroupedGoals(groupGoalsBySkillId(goals, groupedActivity));

        // Fetch user
        setUser(await fetchUser(session.user.id));
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    )

    useEffect(() => {
        fetchData();

        setLoading(false);
    }, [])

    const handleLog = (skillId) => {
        setSelectedSkillId(skillId);
        setLogModalVisible(true);
    }

    const handleCloseLogModal = () => {
        setLogModalVisible(false);
        setSelectedSkillId(null);

        // Refresh data
        fetchData();
    }

    // Loading screen
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator size="large" color={colours.text} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {groupedGoals.map(([skillId, { goals }]) => (
                    <ProgressBar
                        key={skillId}
                        skillId={skillId}
                        userId={session.user.id}
                        skillName={groupedSkills[skillId].name}
                        isStretch={groupedSkills[skillId].is_stretch}
                        inSeconds={groupedSkills[skillId].in_seconds}
                        goals={goals}
                        onLogPress={handleLog}
                        activities={groupedActivity[skillId]}
                        justLoggedActivity={justLoggedActivity}
                        setJustLoggedActivity={setJustLoggedActivity}
                        fetchData={fetchData}
                    />
                ))}
            </ScrollView>
            {selectedSkillId && (
                <LogModal
                    user={user}
                    skillId={selectedSkillId}
                    visible={logModalVisible}
                    onClose={handleCloseLogModal}
                    previousValue={groupedActivity[selectedSkillId] ? getMaxAchievedValue(groupedActivity[selectedSkillId]) : 0}
                    groupedSkills={groupedSkills}
                    setJustLoggedActivity={setJustLoggedActivity}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colours.bg,
        paddingTop: 40,
    },
    scrollView: {
        flexGrow: 1,
        padding: 16,
    },
    progressBarContainer: {
        marginBottom: 10,
        backgroundColor: colours.cardBG,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
    },
    skillTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colours.text,
    },
    progressBar: {
        height: 20,
        backgroundColor: colours.cardBG,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: StyleSheet.hairlineWidth,
        elevation: 4,
    },
    progress: {
        height: '100%',
    },
    progressText: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    logModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    logModalContent: {
        backgroundColor: colours.bg,
        borderRadius: 10,
        alignItems: 'center',
    },
    logModalTouchableContainer: {
        padding: 40,
        paddingTop: 20,
    },
    logModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colours.text,
    },
    logModalSubText: {
        fontSize: 16,
        marginBottom: 5,
        color: colours.subText,
    },
    picker: {
        width: 150,
        color: colours.text,
    },
    logModalButton: {
        marginVertical: -10,
    },
    logButton: {
        marginBottom: -10,
    },
    sideBySide: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: "99%",
    }
});

export default Goals;
