import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colours, masteryColours } from '../constants/colours';
import { useState } from 'react';
import { Button } from '@rneui/themed';
import { Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HeavyButton from './components/HeavyButton';

const PUSHUPS_MAX = 20;
const dummyGoals = [
    {
        id: 1,
        name: "Pushups",
        mastery: 1,
        target_value: 20,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 2,
        name: "Pushups",
        mastery: 2,
        target_value: 40,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 3,
        name: "Pushups",
        mastery: 3,
        target_value: 60,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 4,
        name: "Pushups",
        mastery: 4,
        target_value: 80,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 5,
        name: "Pushups",
        mastery: 5,
        target_value: 100,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 6,
        name: "Pushups",
        mastery: 6,
        target_value: 150,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 7,
        name: "Pushups",
        mastery: 7,
        target_value: 200,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
        in_seconds: false,
    },
    {
        id: 15,
        name: "Pull ups",
        mastery: 1,
        target_value: 10,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 16,
        name: "Pull ups",
        mastery: 2,
        target_value: 15,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 17,
        name: "Pull ups",
        mastery: 3,
        target_value: 20,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 18,
        name: "Pull ups",
        mastery: 4,
        target_value: 30,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 19,
        name: "Pull ups",
        mastery: 5,
        target_value: 40,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 20,
        name: "Pull ups",
        mastery: 6,
        target_value: 50,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 21,
        name: "Pull ups",
        mastery: 7,
        target_value: 70,
        achieved_value: 12,
        is_stretch: false,
        in_seconds: true,
    },
    {
        id: 8,
        name: "The Splits",
        mastery: 1,
        target_value: 1,
        achieved_value: 0,
        is_stretch: true,
        in_seconds: false,
    },
];

const groupBySkill = (data) => {
    const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.name]) {
            acc[curr.name] = [];
        }
        acc[curr.name].push(curr);
        return acc;
    }, {});

    // Sort each skill's goals by mastery
    for (const skill in grouped) {
        grouped[skill].sort((a, b) => a.mastery - b.mastery);
    }

    // Sort skills by number of completed goals
    const sortedGrouped = Object.entries(grouped).sort((a, b) => {
        const aCompleted = a[1].filter(goal => goal.achieved_value >= goal.target_value).length;
        const bCompleted = b[1].filter(goal => goal.achieved_value >= goal.target_value).length;
        return bCompleted - aCompleted;
    });

    return sortedGrouped;
};

const ProgressBar = ({ skill, goals, onLogPress }) => {
    const achievedValue = goals[0].achieved_value;
    const highestAchievedGoal = goals.filter(goal => goal.target_value <= achievedValue).pop();
    const lowestNonAchievedGoal = goals.find(goal => goal.target_value > achievedValue);

    let progress = 0;
    let progressColor = colours.cardBG;
    let startValue = 0;
    let endValue = 0;
    const isStretch = goals[0].is_stretch;

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
            <Text style={styles.skillTitle}>{skill}</Text>
            <Text style={[styles.progressText, { left: `${progress}%`, color: progressColor }]}>{isStretch ? "" : achievedValue}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            <View style={styles.progressBarLabels}>
                <Text>{isStretch ? "Not Completed" : startValue}</Text>
                <Text>{isStretch ? "Completed" : endValue}</Text>
            </View>
            <Button title="Log" onPress={() => onLogPress(goals[0])} />
        </View>
    );
};

const repsToTime = (reps) => {
    const minutes = Math.floor(reps / 60);
    const seconds = reps % 60;
    return { minutes, seconds };
};

const LogModal = ({ visible, onClose, goal }) => {
    // Initialise state based on goal type
    const [completed, setCompleted] = useState(goal.achieved_value == 1);
    const { minutes: initialMinutes, seconds: initialSeconds } = repsToTime(goal.achieved_value);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);
    const [value, setValue] = useState(goal.achieved_value);

    const handleLog = () => {
        // Log the goal based on its type
        if (goal.is_stretch) {
            // Case 1: Stretch is logged as a boolean (completed / not completed)
            
        } else if (goal.in_seconds) {
            // Case 2: Time goals are logged in seconds
            const totalSeconds = minutes * 60 + seconds;
            
        } else {
            // Case 3: Reps are logged
            
        }

        // Close the modal
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <TouchableOpacity activeOpacity={1} style={styles.logModalContainer} onPress={onClose}>
                <View style={styles.logModalContent}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.logModalTouchableContainer}>
                        <Text style={styles.logModalTitle}>{goal.name}</Text>
                        {goal.is_stretch ? (
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
                        ) : goal.in_seconds ? (
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
                                    selectedValue={value}
                                    onValueChange={(itemValue) => setValue(itemValue)}
                                >
                                    {[...Array(501).keys()].map((i) => (
                                        <Picker.Item key={i} label={`${i}`} value={i} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                        <HeavyButton onPress={handleLog} title="Log" style={styles.logModalButton} color={"#0099ff"} borderColor={"#33ccff"} />
                        <HeavyButton onPress={onClose} title="Close" style={styles.logModalButton} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const Goals = () => {
    const groupedGoals = groupBySkill(dummyGoals);

    const [logModalVisible, setLogModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleLog = (goal) => {
        setSelectedGoal(goal);
        setLogModalVisible(true);
    }

    const handleCloseLogModal = () => {
        setLogModalVisible(false);
        setSelectedGoal(null);
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {groupedGoals.map(([skill, goals]) => (
                    <ProgressBar key={skill} skill={skill} goals={goals} onLogPress={handleLog} />
                ))}
            </ScrollView>
            {selectedGoal && (
                <LogModal
                    visible={logModalVisible}
                    onClose={handleCloseLogModal}
                    goal={selectedGoal}
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
});

export default Goals;
