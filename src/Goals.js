import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colours, masteryColours } from '../constants/colours';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HeavyButton from './components/HeavyButton';
import { fetchGoals, getMaxAchievedValue, groupGoalsBySkillId } from './operations/Goals';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserActivity, groupActivityBySkillId, logActivity } from './operations/Activity';
import { fetchSkills, groupSkillsById } from './operations/Skills';


const ProgressBar = ({ skillId, skillName, goals, onLogPress, activities, isStretch }) => {
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
            <Text style={styles.skillTitle}>{skillName}</Text>
            <Text style={[styles.progressText, { left: `${progress}%`, color: progressColor }]}>{isStretch ? "" : achievedValue}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            <View style={styles.progressBarLabels}>
                <Text>{isStretch ? "Not Completed" : startValue}</Text>
                <Text>{isStretch ? "Completed" : endValue}</Text>
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

const LogModal = ({ userId, skillId, visible, onClose, previousValue, groupedSkills }) => {
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
        await logActivity(userId, skillId, value);
        setLoading(false);

        // Close the modal
        onClose();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.activityIndicator]}>
                <ActivityIndicator size="large" color={colours.text} />
            </View>
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
    const [loading, setLoading] = useState(true);

    const [logModalVisible, setLogModalVisible] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState(null);

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
                        skillName={groupedSkills[skillId].name}
                        isStretch={groupedSkills[skillId].is_stretch}
                        goals={goals}
                        onLogPress={handleLog}
                        activities={groupedActivity[skillId]}
                    />
                ))}
            </ScrollView>
            {selectedSkillId && (
                <LogModal
                    userId={session.user.id}
                    skillId={selectedSkillId}
                    visible={logModalVisible}
                    onClose={handleCloseLogModal}
                    previousValue={groupedActivity[selectedSkillId] ? getMaxAchievedValue(groupedActivity[selectedSkillId]) : 0}
                    groupedSkills={groupedSkills}
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
        transform: [{ translateX: -10 }],
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
    activityIndicator: {
        justifyContent: 'center',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    logButton: {
        marginBottom: -10,
    }
});

export default Goals;
